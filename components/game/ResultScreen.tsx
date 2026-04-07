import { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Image } from "expo-image";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { MediaDetails, GuessResult, GameStatus } from "@/types";
import { useTranslation } from "@/i18n";

interface ResultScreenProps {
  answer: MediaDetails;
  status: GameStatus;
  guesses: GuessResult[];
  hintsUsed: number;
  maxAttempts: number;
  coinsEarned?: number;
  streakMilestone?: number | null;
  freezeUsed?: boolean;
}

export default function ResultScreen({ answer, status, guesses, hintsUsed, maxAttempts, coinsEarned, streakMilestone, freezeUsed }: ResultScreenProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const won = status === "won";
  const attempts = guesses.length;
  const exactCount = guesses.reduce(
    (sum, g) => sum + g.comparison.filter((c) => c.status === "exact").length,
    0
  );
  const totalFields = guesses.reduce((sum, g) => sum + g.comparison.length, 0);
  const accuracy = totalFields > 0 ? Math.round((exactCount / totalFields) * 100) : 0;

  async function handleShare() {
    const text = t.result.shareText(answer.title, attempts, maxAttempts);
    try {
      await Clipboard.setStringAsync(text);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silently fail
    }
  }

  const stats = [
    { icon: "locate-outline" as const, label: t.result.attempts, value: `${attempts}/${maxAttempts}` },
    { icon: "bulb-outline" as const, label: t.result.hintsUsed, value: `${hintsUsed}` },
    { icon: "bar-chart-outline" as const, label: t.result.accuracy, value: `${accuracy}%` },
  ];

  return (
    <View className="rounded-2xl border border-border overflow-hidden" style={{ backgroundColor: "#151517" }}>
      {/* Header banner */}
      <View
        className="items-center gap-3 px-6 py-8"
        style={{ backgroundColor: won ? "rgba(0,230,118,0.08)" : "rgba(255,82,82,0.08)" }}
      >
        <View
          className="h-14 w-14 items-center justify-center rounded-full"
          style={{ backgroundColor: won ? "rgba(0,230,118,0.2)" : "rgba(255,82,82,0.2)" }}
        >
          <Ionicons
            name={won ? "trophy" : "close-circle"}
            size={28}
            color={won ? "#00e676" : "#ff5252"}
          />
        </View>
        <Text
          className="text-2xl font-heading-bold"
          style={{ color: won ? "#00e676" : "#ff5252" }}
        >
          {won ? t.result.youGuessed : t.game.lost}
        </Text>
      </View>

      {/* Movie info */}
      <View className="items-center gap-5 px-6 py-6">
        {answer.posterPath ? (
          <View className="h-72 w-48 overflow-hidden rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
            <Image
              source={{ uri: `https://image.tmdb.org/t/p/w342${answer.posterPath}` }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
          </View>
        ) : null}

        <View className="items-center">
          <Text className="text-2xl font-heading-bold text-primary text-center">
            {answer.title}
          </Text>
          <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">
            {answer.year} · {answer.director} · {answer.runtime} min
          </Text>
          <View className="mt-2 flex-row flex-wrap justify-center gap-1.5">
            {answer.genres.map((genre) => (
              <View key={genre} className="rounded-full px-2.5 py-0.5" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                <Text className="text-xs font-sans-medium text-muted-foreground">{genre}</Text>
              </View>
            ))}
          </View>
          {answer.tagline ? (
            <Text className="mt-3 text-sm font-sans-medium text-center" style={{ color: "rgba(138,138,154,0.7)", fontStyle: "italic" }}>
              "{answer.tagline}"
            </Text>
          ) : null}
        </View>
      </View>

      {/* Emoji grid */}
      <View className="px-6 py-4 border-t border-border">
        <View className="flex-row flex-wrap gap-3">
          {guesses.map((g, i) => (
            <View key={i} className="flex-row items-center gap-1.5">
              <Text className="text-[10px] font-sans-medium text-muted-foreground">
                #{i + 1}
              </Text>
              <View className="flex-row gap-0.5">
                {g.comparison.map((c, j) => (
                  <View
                    key={j}
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 2,
                      backgroundColor:
                        c.status === "exact" ? "#00e676" : c.status === "partial" ? "#ffc107" : "#ff5252",
                    }}
                  />
                ))}
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Stats */}
      <View className="flex-row border-t border-border">
        {stats.map((stat) => (
          <View key={stat.label} className="flex-1 items-center justify-center gap-1.5 py-5">
            <Ionicons name={stat.icon} size={18} color="#8a8a9a" />
            <Text className="text-lg font-heading-bold text-primary">{stat.value}</Text>
            <Text className="text-xs font-sans-medium text-muted-foreground">{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Coins earned */}
      {won && coinsEarned !== undefined && coinsEarned > 0 && (
        <View className="px-6 py-4 border-t border-border">
          <View className="flex-row items-center justify-center gap-2">
            <Ionicons name="diamond" size={18} color="#ffc107" />
            <Text className="text-lg font-heading-bold text-warning">+{coinsEarned}</Text>
            <Text className="text-sm font-sans-medium text-muted-foreground">{t.coins.earned}</Text>
          </View>
          {streakMilestone && streakMilestone > 0 && (
            <View className="mt-2 flex-row items-center justify-center gap-1.5 rounded-lg bg-accent/10 py-2 px-3">
              <Ionicons name="flame" size={14} color="#7c4dff" />
              <Text className="text-sm font-sans-bold text-accent">
                {t.coins.streakBonus} +{streakMilestone}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Freeze used on loss */}
      {!won && freezeUsed && (
        <View className="px-6 py-4 border-t border-border">
          <View className="flex-row items-center justify-center gap-2 rounded-lg py-2 px-3" style={{ backgroundColor: "rgba(0,188,212,0.1)" }}>
            <Ionicons name="snow" size={16} color="#00bcd4" />
            <Text className="text-sm font-sans-bold" style={{ color: "#00bcd4" }}>
              {t.coins.freezeProtected}
            </Text>
          </View>
        </View>
      )}

      {/* Share button */}
      <View className="px-6 pb-6">
        <Pressable
          onPress={handleShare}
          className="flex-row items-center justify-center gap-2 rounded-xl bg-accent py-3.5"
        >
          <Ionicons name={copied ? "checkmark" : "copy-outline"} size={16} color="#ffffff" />
          <Text className="text-sm font-sans-bold text-accent-foreground">
            {copied ? t.result.copied : t.result.share}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
