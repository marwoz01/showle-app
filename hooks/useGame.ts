import { useState, useMemo, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MediaDetails, GuessResult, Hint, GameStatus } from "@/types";
import { compareMedia } from "@/lib/comparer";
import { generateHints, getRevealedHints } from "@/lib/hints";
import { MAX_ATTEMPTS } from "@/constants";
import { Translations } from "@/i18n/types";
import { getTodayKey } from "@/lib/daily";
import { getMovieDetails } from "@/lib/tmdb";
import { api } from "@/lib/api";
import { SaveStateBody } from "@/lib/api-types";
import { enqueueCompletion } from "@/lib/sync-queue";

interface SavedGameState {
  dateKey: string;
  guessIds: number[];
  status: GameStatus;
}

const STORAGE_KEY = "showle-daily-movie";

async function loadSavedState(): Promise<SavedGameState | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved: SavedGameState = JSON.parse(raw);
    if (saved.dateKey !== getTodayKey()) return null;
    return saved;
  } catch {
    return null;
  }
}

async function saveLocalState(guessIds: number[], status: GameStatus) {
  try {
    const state: SavedGameState = {
      dateKey: getTodayKey(),
      guessIds,
      status,
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // AsyncStorage unavailable
  }
}

function buildSyncPayload(
  guessIds: number[],
  status: GameStatus,
  answer: MediaDetails,
  hintsCount: number,
): SaveStateBody {
  return {
    dateKey: getTodayKey(),
    mode: "daily-movie",
    status,
    guessIds,
    attemptCount: guessIds.length,
    hintsUsed: hintsCount,
    targetMovieId: answer.id,
    targetTitle: answer.title,
    targetYear: answer.year,
    targetPoster: answer.posterPath,
  };
}

interface UseGameReturn {
  guesses: GuessResult[];
  revealedHints: Hint[];
  allHints: Hint[];
  status: GameStatus;
  attemptCount: number;
  submitGuess: (guess: MediaDetails) => void;
  giveUp: () => void;
}

export function useGame(answer: MediaDetails, t: Translations): UseGameReturn {
  const [initialized, setInitialized] = useState(false);
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [status, setStatus] = useState<GameStatus>("playing");

  const allHints = useMemo(() => generateHints(answer, t), [answer, t]);
  const attemptCount = guesses.length;
  const revealedHints = useMemo(
    () => getRevealedHints(allHints, attemptCount),
    [allHints, attemptCount],
  );

  // Restore game: local-first, then try server
  useEffect(() => {
    async function restore() {
      const localState = await loadSavedState();

      // Try server state in parallel
      let serverGuessIds: number[] | null = null;
      let serverStatus: GameStatus | null = null;
      try {
        const serverState = await api.game.getState(getTodayKey());
        if (serverState && serverState.guessIds.length > 0) {
          serverGuessIds = serverState.guessIds;
          serverStatus = serverState.status;
        }
      } catch {
        // Server unavailable — use local
      }

      // Pick whichever has more guesses (server wins ties when both available)
      const localIds = localState?.guessIds ?? [];
      const useServer =
        serverGuessIds !== null && serverGuessIds.length >= localIds.length;
      const idsToRestore = useServer ? serverGuessIds! : localIds;
      const statusToRestore = useServer
        ? serverStatus!
        : (localState?.status ?? "playing");

      if (idsToRestore.length > 0) {
        try {
          const movies = await Promise.all(
            idsToRestore.map((id) => getMovieDetails(id)),
          );

          const restoredGuesses: GuessResult[] = [];
          for (const movie of movies) {
            if (movie) {
              const comparison = compareMedia(movie, answer, t);
              const isCorrect = movie.id === answer.id;
              restoredGuesses.push({
                guess: movie,
                comparison,
                isCorrect,
                attemptNumber: restoredGuesses.length + 1,
              });
            }
          }
          setGuesses(restoredGuesses.reverse());
          setStatus(statusToRestore);
        } catch {
          // Ignore restore errors, start fresh
        }
      }
      setInitialized(true);
    }

    restore();
  }, []);

  // Persist state changes to AsyncStorage + fire-and-forget server sync
  useEffect(() => {
    if (!initialized) return;
    const ids = guesses
      .slice()
      .reverse()
      .map((g) => g.guess.id);
    saveLocalState(ids, status);

    // Fire-and-forget server sync for in-progress games
    if (ids.length > 0 && status === "playing") {
      const hintsCount = getRevealedHints(allHints, ids.length).length;
      api.game
        .saveState(buildSyncPayload(ids, status, answer, hintsCount))
        .catch(() => {});
    }
  }, [guesses, status, initialized]);

  // Handle game completion server sync
  useEffect(() => {
    if (!initialized) return;
    if (status !== "won" && status !== "lost") return;

    const ids = guesses
      .slice()
      .reverse()
      .map((g) => g.guess.id);
    const hintsCount = getRevealedHints(allHints, ids.length).length;
    const payload = buildSyncPayload(ids, status, answer, hintsCount);

    api.game.complete(payload).catch(() => {
      // Offline — queue for later
      enqueueCompletion(payload).catch(() => {});
    });
  }, [status, initialized]);

  const submitGuess = useCallback(
    (guess: MediaDetails) => {
      if (status !== "playing") return;
      if (guesses.some((g) => g.guess.id === guess.id)) return;

      const comparison = compareMedia(guess, answer, t);
      const isCorrect = guess.id === answer.id;
      const newAttempt = attemptCount + 1;

      const result: GuessResult = {
        guess,
        comparison,
        isCorrect,
        attemptNumber: newAttempt,
      };

      const newGuesses = [result, ...guesses];
      setGuesses(newGuesses);

      if (isCorrect) setStatus("won");
      else if (newAttempt >= MAX_ATTEMPTS) setStatus("lost");
    },
    [status, guesses, answer, t, attemptCount],
  );

  const giveUp = useCallback(() => {
    if (status === "playing") {
      setStatus("lost");
    }
  }, [status]);

  return {
    guesses,
    revealedHints,
    allHints,
    status,
    attemptCount,
    submitGuess,
    giveUp,
  };
}
