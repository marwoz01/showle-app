import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MediaDetails, GuessResult, Hint, GameStatus } from "@/types";
import { compareMedia } from "@/lib/comparer";
import { generateHints, getRevealedHints } from "@/lib/hints";
import { MAX_ATTEMPTS, MAX_EXTRA_ATTEMPTS, REVEALABLE_FIELDS, RevealableField } from "@/constants";
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
  extraAttemptsBought?: number;
  revealedFieldKeys?: string[];
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

async function saveLocalState(
  guessIds: number[],
  status: GameStatus,
  extraAttemptsBought: number,
  revealedFieldKeys: string[],
) {
  try {
    const state: SavedGameState = {
      dateKey: getTodayKey(),
      guessIds,
      status,
      extraAttemptsBought,
      revealedFieldKeys,
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
  extraAttempts: number,
  revealedFieldKeys: string[],
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
    extraAttempts,
    paidHintUsed: revealedFieldKeys.length > 0,
    paidHintsCount: revealedFieldKeys.length,
  };
}

export interface UseGameReturn {
  guesses: GuessResult[];
  revealedHints: Hint[];
  allHints: Hint[];
  status: GameStatus;
  attemptCount: number;
  submitGuess: (guess: MediaDetails) => void;
  giveUp: () => void;
  // Coin economy
  revealedFieldKeys: string[];
  canBuyFieldReveal: boolean;
  extraAttemptsBought: number;
  canBuyExtraAttempt: boolean;
  buyExtraAttempt: () => Promise<boolean>;
  buyFieldReveal: () => Promise<string | null>;
  declineBuyAttempt: () => void;
  // Completion data
  completionData: { coinsEarned: number; streakMilestone: number | null; freezeUsed: boolean } | null;
}

export function useGame(
  answer: MediaDetails,
  t: Translations,
  spendCoins: (action: "buy_hint" | "buy_attempt", dateKey?: string) => Promise<any>,
): UseGameReturn {
  const [initialized, setInitialized] = useState(false);
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [status, setStatus] = useState<GameStatus>("playing");
  const [revealedFieldKeys, setRevealedFieldKeys] = useState<string[]>([]);
  const [extraAttemptsBought, setExtraAttemptsBought] = useState(0);
  const [completionData, setCompletionData] = useState<UseGameReturn["completionData"]>(null);

  const allHints = useMemo(() => generateHints(answer, t), [answer, t]);
  const attemptCount = guesses.length;
  const revealedHints = useMemo(
    () => getRevealedHints(allHints, attemptCount),
    [allHints, attemptCount],
  );

  // Compute which fields are already revealed by guesses
  const guessRevealedFields = useMemo(() => {
    const fields = new Set<string>();
    for (const g of guesses) {
      for (const f of g.comparison) {
        if (f.status === "exact") {
          // Map label back to field key
          const key = REVEALABLE_FIELDS.find((k) => {
            const labelMap: Record<string, string> = {
              year: t.comparison.year,
              genre: t.comparison.genre,
              country: t.comparison.country,
              director: t.comparison.director,
              leadActor: t.comparison.leadActor,
              runtime: t.comparison.runtime,
              rating: t.comparison.rating,
            };
            return labelMap[k] === f.label;
          });
          if (key) fields.add(key);
        }
      }
    }
    return fields;
  }, [guesses, t]);

  const canBuyFieldReveal = status === "playing" &&
    REVEALABLE_FIELDS.some((k) => !guessRevealedFields.has(k) && !revealedFieldKeys.includes(k));

  const maxAttempts = MAX_ATTEMPTS + extraAttemptsBought;

  // Can buy extra attempt: used all current attempts, game still "playing", and haven't bought max
  const canBuyExtraAttempt =
    status === "playing" &&
    attemptCount >= maxAttempts &&
    extraAttemptsBought < MAX_EXTRA_ATTEMPTS;

  // Restore game: local-first, then try server
  useEffect(() => {
    async function restore() {
      const localState = await loadSavedState();

      let serverGuessIds: number[] | null = null;
      let serverStatus: GameStatus | null = null;
      try {
        const serverState = await api.game.getState(getTodayKey());
        if (serverState && serverState.guessIds.length > 0) {
          serverGuessIds = serverState.guessIds;
          serverStatus = serverState.status;
        }
      } catch {
        // Server unavailable
      }

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
          // Start fresh
        }
      }

      // Restore coin state from local
      if (localState) {
        setRevealedFieldKeys(localState.revealedFieldKeys ?? []);
        setExtraAttemptsBought(localState.extraAttemptsBought ?? 0);
      }

      // Mark if game was already finished when restored (skip reward modal)
      const finalStatus = idsToRestore.length > 0 ? statusToRestore : "playing";
      if (finalStatus === "won" || finalStatus === "lost") {
        restoredAsFinished.current = true;
      }

      setInitialized(true);
    }

    restore();
  }, []);

  // Persist state changes
  useEffect(() => {
    if (!initialized) return;
    const ids = guesses
      .slice()
      .reverse()
      .map((g) => g.guess.id);
    saveLocalState(ids, status, extraAttemptsBought, revealedFieldKeys);

    // Fire-and-forget server sync for in-progress games
    if (ids.length > 0 && status === "playing") {
      const hintsCount = getRevealedHints(allHints, ids.length).length;
      api.game
        .saveState(buildSyncPayload(ids, status, answer, hintsCount, extraAttemptsBought, revealedFieldKeys))
        .catch(() => {});
    }
  }, [guesses, status, initialized, extraAttemptsBought, revealedFieldKeys]);

  // Track whether completion was already sent (prevents duplicate calls on restore)
  const completionSent = useRef(false);
  // True if game was restored from cache as already finished
  const restoredAsFinished = useRef(false);

  // Handle game completion server sync
  useEffect(() => {
    if (!initialized) return;
    if (status !== "won" && status !== "lost") return;
    if (completionSent.current) return;

    completionSent.current = true;

    const ids = guesses
      .slice()
      .reverse()
      .map((g) => g.guess.id);
    const hintsCount = getRevealedHints(allHints, ids.length).length;
    const payload = buildSyncPayload(ids, status, answer, hintsCount, extraAttemptsBought, revealedFieldKeys);

    // Only show reward modal for fresh completions (not restored from cache)
    const isFreshCompletion = !restoredAsFinished.current;

    api.game.complete(payload)
      .then((res) => {
        if (isFreshCompletion) {
          setCompletionData({
            coinsEarned: res.coinsEarned ?? 0,
            streakMilestone: res.streakMilestone ?? null,
            freezeUsed: res.freezeUsed ?? false,
          });
        }
      })
      .catch(() => {
        enqueueCompletion(payload).catch(() => {});
      });
  }, [status, initialized]);

  const submitGuess = useCallback(
    (guess: MediaDetails) => {
      if (status !== "playing") return;
      if (guesses.some((g) => g.guess.id === guess.id)) return;
      if (attemptCount >= maxAttempts) return; // Waiting for buy or decline

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

      if (isCorrect) {
        setStatus("won");
      }
      // Don't auto-set "lost" — let canBuyExtraAttempt gate it
    },
    [status, guesses, answer, t, attemptCount, maxAttempts],
  );

  const giveUp = useCallback(() => {
    if (status === "playing") {
      setStatus("lost");
    }
  }, [status]);

  const declineBuyAttempt = useCallback(() => {
    if (status === "playing") {
      setStatus("lost");
    }
  }, [status]);

  const buyExtraAttempt = useCallback(async (): Promise<boolean> => {
    const dateKey = getTodayKey();
    const result = await spendCoins("buy_attempt", dateKey);
    if (result) {
      setExtraAttemptsBought((prev) => prev + 1);
      return true;
    }
    return false;
  }, [spendCoins]);

  const buyFieldReveal = useCallback(async (): Promise<string | null> => {
    // Pick a random unrevealed field
    const unrevealed = REVEALABLE_FIELDS.filter(
      (k) => !guessRevealedFields.has(k) && !revealedFieldKeys.includes(k),
    );
    if (unrevealed.length === 0) return null;

    // Ensure game state exists on server before spending
    const ids = guesses.slice().reverse().map((g) => g.guess.id);
    const hintsCount = getRevealedHints(allHints, ids.length).length;
    try {
      await api.game.saveState(buildSyncPayload(ids, status, answer, hintsCount, extraAttemptsBought, revealedFieldKeys));
    } catch {
      // Continue anyway — state might already exist
    }

    const dateKey = getTodayKey();
    const result = await spendCoins("buy_hint", dateKey);
    if (result) {
      const picked = unrevealed[Math.floor(Math.random() * unrevealed.length)];
      setRevealedFieldKeys((prev) => [...prev, picked]);
      return picked;
    }
    return null;
  }, [guessRevealedFields, revealedFieldKeys, spendCoins, guesses, allHints, status, answer, extraAttemptsBought]);

  return {
    guesses,
    revealedHints,
    allHints,
    status,
    attemptCount,
    submitGuess,
    giveUp,
    revealedFieldKeys,
    canBuyFieldReveal,
    extraAttemptsBought,
    canBuyExtraAttempt,
    buyExtraAttempt,
    buyFieldReveal,
    declineBuyAttempt,
    completionData,
  };
}
