import { View, Text } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { GuessResult, MatchStatus, Direction } from "@/types";
import { useTranslation } from "@/i18n";

interface GuessCardProps {
  result: GuessResult;
}

const statusColors: Record<MatchStatus, { dot: string; text: string; bg: string }> = {
  exact: { dot: "#00e676", text: "#00e676", bg: "rgba(0,230,118,0.08)" },
  partial: { dot: "#ffc107", text: "#ffc107", bg: "rgba(255,193,7,0.08)" },
  miss: { dot: "#ff5252", text: "#ff5252", bg: "rgba(255,82,82,0.08)" },
};

export default function GuessCard({ result }: GuessCardProps) {
  const { t } = useTranslation();

  return (
    <View
      className="rounded-2xl border overflow-hidden"
      style={
        result.isCorrect
          ? { borderColor: "#00e6764d", backgroundColor: "#00e6760d" }
          : { borderColor: "#252528", backgroundColor: "#151517" }
      }
    >
      {/* Header: poster + movie info */}
      <View className="flex-row p-3.5 gap-3.5">
        {/* Poster */}
        {result.guess.posterPath ? (
          <View
            className="overflow-hidden rounded-xl"
            style={{ width: 72, height: 108, backgroundColor: "rgba(255,255,255,0.05)" }}
          >
            <Image
              source={{ uri: `https://image.tmdb.org/t/p/w185${result.guess.posterPath}` }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
          </View>
        ) : (
          <View
            className="items-center justify-center rounded-xl"
            style={{ width: 72, height: 108, backgroundColor: "rgba(255,255,255,0.05)" }}
          >
            <Ionicons name="film-outline" size={24} color="#8a8a9a" />
          </View>
        )}

        {/* Info */}
        <View className="flex-1 justify-center">
          <View className="flex-row items-center gap-2">
            <View
              className="h-6 w-6 items-center justify-center rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
            >
              <Text style={{ color: "#8a8a9a", fontSize: 10, fontWeight: "700" }}>
                #{result.attemptNumber}
              </Text>
            </View>
            {result.isCorrect && (
              <View className="rounded-md px-2 py-0.5" style={{ backgroundColor: "#00e67633" }}>
                <Text style={{ color: "#00e676", fontSize: 10, fontWeight: "700" }}>
                  {t.game.correct}
                </Text>
              </View>
            )}
          </View>

          <Text
            className="mt-1.5 text-base font-heading-semibold text-primary"
            numberOfLines={2}
          >
            {result.guess.title}
          </Text>
          <Text className="mt-0.5 text-xs font-sans-medium text-muted-foreground">
            {result.guess.year} · {result.guess.director}
          </Text>

          {/* Genre badges */}
          {result.guess.genres.length > 0 && (
            <View className="mt-2 flex-row flex-wrap gap-1">
              {result.guess.genres.slice(0, 3).map((genre) => (
                <View
                  key={genre}
                  className="rounded-full px-2 py-0.5"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                >
                  <Text style={{ color: "#8a8a9a", fontSize: 10, fontWeight: "500" }}>
                    {genre}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Comparison rows */}
      <View className="border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        {result.comparison.map((field, index) => {
          const colors = statusColors[field.status];
          return (
            <View
              key={field.label}
              className="flex-row items-center px-3.5 py-2.5"
              style={[
                { backgroundColor: colors.bg },
                index < result.comparison.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: "rgba(255,255,255,0.04)",
                },
              ]}
            >
              {/* Status dot */}
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: colors.dot,
                  marginRight: 10,
                }}
              />

              {/* Label */}
              <Text
                style={{
                  color: "#8a8a9a",
                  fontSize: 12,
                  fontWeight: "500",
                  width: 80,
                }}
                numberOfLines={1}
              >
                {field.label}
              </Text>

              {/* Value */}
              <View className="flex-1 flex-row items-center justify-end gap-1">
                <Text
                  style={{ color: colors.text, fontSize: 13, fontWeight: "600" }}
                  numberOfLines={1}
                >
                  {field.guessValue}
                </Text>
                {field.direction && (
                  <Ionicons
                    name={field.direction === "up" ? "chevron-up" : "chevron-down"}
                    size={14}
                    color={colors.text}
                  />
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
