import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { MediaDetails } from "@/types";
import { MAX_ATTEMPTS } from "@/constants";
import { useGame } from "@/hooks/useGame";
import { useTranslation } from "@/i18n";
import { getDailyMovie } from "@/lib/daily";
import SearchBar from "@/components/game/SearchBar";
import GuessCard from "@/components/game/GuessCard";
import HintsPanel from "@/components/game/HintsPanel";
import ResultScreen from "@/components/game/ResultScreen";
import CountdownTimer from "@/components/game/CountdownTimer";

export default function DailyScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [dailyAnswer, setDailyAnswer] = useState<MediaDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchDaily() {
      try {
        const movie = await getDailyMovie();
        if (!movie) throw new Error("No movie");
        setDailyAnswer(movie);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchDaily();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#7c4dff" />
      </View>
    );
  }

  if (error || !dailyAnswer) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Ionicons name="cloud-offline-outline" size={48} color="#8a8a9a" />
        <Text className="mt-4 text-base font-sans-medium text-muted-foreground text-center">
          {t.game.loadError}
        </Text>
        <Pressable
          onPress={() => {
            setError(false);
            setLoading(true);
            getDailyMovie().then((movie) => {
              if (movie) setDailyAnswer(movie);
              else setError(true);
              setLoading(false);
            });
          }}
          className="btn-3d mt-6"
        >
          <Text className="btn-3d-text">Retry</Text>
        </Pressable>
      </View>
    );
  }

  return <GameView dailyAnswer={dailyAnswer} />;
}

function GameView({ dailyAnswer }: { dailyAnswer: MediaDetails }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const {
    guesses,
    revealedHints,
    allHints,
    status,
    attemptCount,
    submitGuess,
    giveUp,
  } = useGame(dailyAnswer, t);

  const isFinished = status === "won" || status === "lost";

  function handleGuess(movie: MediaDetails) {
    submitGuess(movie);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function handleGiveUp() {
    giveUp();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 120,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <Text className="text-3xl font-heading-bold text-primary">
          {t.game.dailyMovie}
        </Text>

        {/* Stats row */}
        <View className="mt-4 flex-row items-center justify-between rounded-2xl border border-border bg-card px-5 py-4">
          <CountdownTimer />
          <View className="h-5 w-px bg-border" />
          <View className="flex-row items-center gap-2">
            <Text className="text-sm font-sans-medium text-muted-foreground">
              {t.game.attempt}
            </Text>
            <Text className="text-lg font-heading-bold text-primary">
              {attemptCount}/{MAX_ATTEMPTS}
            </Text>
          </View>
        </View>

        {/* Search */}
        {status === "playing" && (
          <View className="mt-5">
            <SearchBar onSelect={handleGuess} />
          </View>
        )}

        {/* Give up */}
        {status === "playing" && (
          <Pressable
            onPress={handleGiveUp}
            className="mt-4 flex-row items-center justify-center gap-2 rounded-xl border py-3"
            style={{ borderColor: "rgba(255,82,82,0.25)" }}
          >
            <Ionicons name="flag" size={16} color="#ff5252" />
            <Text style={{ color: "#ff5252", fontSize: 14, fontWeight: "600" }}>
              {t.game.giveUp}
            </Text>
          </Pressable>
        )}

        {/* Result */}
        {isFinished && (
          <View className="mt-6">
            <ResultScreen
              answer={dailyAnswer}
              status={status}
              guesses={guesses}
              hintsUsed={revealedHints.length}
            />
          </View>
        )}

        {/* Empty state */}
        {guesses.length === 0 && status === "playing" && (
          <View className="mt-6 items-center rounded-2xl border border-dashed border-border py-10 px-6">
            <Ionicons name="film-outline" size={32} color="#8a8a9a" />
            <Text className="mt-3 text-sm font-sans-medium text-muted-foreground text-center">
              {t.game.emptyState}
            </Text>
          </View>
        )}

        {/* Guesses */}
        {guesses.length > 0 && (
          <View className="mt-6 gap-4">
            {guesses.map((result) => (
              <GuessCard key={result.guess.id} result={result} />
            ))}
          </View>
        )}

        {/* Hints */}
        <View className="mt-6">
          <HintsPanel revealedHints={revealedHints} totalHints={allHints.length} />
        </View>
      </ScrollView>
    </View>
  );
}
