import { View, Text } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { GameStateResponse } from "@/lib/api-types";
import { MAX_ATTEMPTS } from "@/constants";
import { useTranslation } from "@/i18n";

interface GameHistoryItemProps {
  game: GameStateResponse;
}

export default function GameHistoryItem({ game }: GameHistoryItemProps) {
  const { t } = useTranslation();
  const won = game.status === "won";

  const date = game.completedAt
    ? new Date(game.completedAt).toLocaleDateString()
    : game.dateKey;

  return (
    <View
      className="flex-row items-center gap-3 rounded-xl border border-border bg-card px-3 py-3"
    >
      {/* Poster */}
      {game.targetPoster ? (
        <View
          className="overflow-hidden rounded-lg"
          style={{ width: 40, height: 60, backgroundColor: "rgba(255,255,255,0.05)" }}
        >
          <Image
            source={{ uri: `https://image.tmdb.org/t/p/w92${game.targetPoster}` }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />
        </View>
      ) : (
        <View
          className="items-center justify-center rounded-lg"
          style={{ width: 40, height: 60, backgroundColor: "rgba(255,255,255,0.05)" }}
        >
          <Ionicons name="film-outline" size={18} color="#8a8a9a" />
        </View>
      )}

      {/* Info */}
      <View className="flex-1">
        <Text className="text-sm font-heading-semibold text-primary" numberOfLines={1}>
          {game.targetTitle}
        </Text>
        <Text className="mt-0.5 text-xs font-sans-medium text-muted-foreground">
          {date} · {game.targetYear}
        </Text>
      </View>

      {/* Status badge + attempts */}
      <View className="items-end gap-1">
        <View
          className="rounded-md px-2 py-0.5"
          style={{
            backgroundColor: won ? "rgba(0,230,118,0.15)" : "rgba(255,82,82,0.15)",
          }}
        >
          <Text
            style={{
              color: won ? "#00e676" : "#ff5252",
              fontSize: 11,
              fontWeight: "700",
            }}
          >
            {won ? t.profile.won : t.profile.lost}
          </Text>
        </View>
        <Text className="text-xs font-sans-medium text-muted-foreground">
          {game.attemptCount}/{MAX_ATTEMPTS} {t.profile.attempts}
        </Text>
      </View>
    </View>
  );
}
