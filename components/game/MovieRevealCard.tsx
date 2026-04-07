import { useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MediaDetails, GuessResult } from "@/types";
import { COST_HINT, REVEALABLE_FIELDS } from "@/constants";
import { useTranslation } from "@/i18n";

interface MovieRevealCardProps {
  answer: MediaDetails;
  guesses: GuessResult[];
  revealedFieldKeys: string[];
  canBuyFieldReveal: boolean;
  isPlaying: boolean;
  onBuyReveal: () => void;
}

const FIELD_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  year: "calendar-outline",
  genre: "pricetag-outline",
  country: "globe-outline",
  director: "videocam-outline",
  leadActor: "person-outline",
  runtime: "time-outline",
  popularity: "trending-up-outline",
  budget: "cash-outline",
  rating: "star-outline",
};

export default function MovieRevealCard({
  answer,
  guesses,
  revealedFieldKeys,
  canBuyFieldReveal,
  isPlaying,
  onBuyReveal,
}: MovieRevealCardProps) {
  const { t } = useTranslation();

  const FIELD_LABELS: Record<string, string> = {
    year: t.comparison.year,
    genre: t.comparison.genre,
    country: t.comparison.country,
    director: t.comparison.director,
    leadActor: t.comparison.leadActor,
    runtime: t.comparison.runtime,
    popularity: t.comparison.popularity,
    budget: t.comparison.budget,
    rating: t.comparison.rating,
  };

  const FIELD_VALUES: Record<string, string> = {
    year: String(answer.year),
    genre: answer.genres.join(", "),
    country: answer.country,
    director: answer.director,
    leadActor: answer.leadActor,
    runtime: `${answer.runtime} min`,
    popularity: getPopularityLabel(answer.popularity, t),
    budget: answer.budget > 0 ? `$${answer.budget}M` : "?",
    rating: answer.rating.toFixed(1),
  };

  // Fields revealed by exact guesses
  const guessRevealed = useMemo(() => {
    const keys = new Set<string>();
    for (const g of guesses) {
      for (const f of g.comparison) {
        if (f.status === "exact") {
          const key = REVEALABLE_FIELDS.find((k) => FIELD_LABELS[k] === f.label);
          if (key) keys.add(key);
        }
      }
    }
    return keys;
  }, [guesses]);

  const fields = REVEALABLE_FIELDS.map((key) => {
    const isRevealed = guessRevealed.has(key) || revealedFieldKeys.includes(key);
    const isBought = revealedFieldKeys.includes(key) && !guessRevealed.has(key);
    return {
      key,
      label: FIELD_LABELS[key],
      value: isRevealed ? FIELD_VALUES[key] : null,
      icon: FIELD_ICONS[key],
      isBought,
    };
  });

  const revealedCount = fields.filter((f) => f.value !== null).length;

  return (
    <View className="rounded-2xl border border-border bg-card p-4">
      <View className="flex-row gap-4">
        {/* Poster placeholder */}
        <View
          className="w-20 self-stretch items-center justify-center rounded-xl overflow-hidden"
          style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
        >
          {revealedCount >= REVEALABLE_FIELDS.length ? (
            answer.posterPath ? (
              <View className="flex-1 w-full items-center justify-center">
                <Ionicons name="checkmark-circle" size={28} color="#00e676" />
              </View>
            ) : (
              <Ionicons name="film" size={28} color="#00e676" />
            )
          ) : (
            <View className="items-center gap-1">
              <Ionicons name="help-outline" size={28} color="rgba(138,138,154,0.3)" />
              <Text style={{ color: "rgba(138,138,154,0.3)", fontSize: 10 }}>
                {revealedCount}/{REVEALABLE_FIELDS.length}
              </Text>
            </View>
          )}
        </View>

        {/* Fields */}
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-2.5">
            <Text className="text-xs font-sans-semibold uppercase tracking-wider text-muted-foreground">
              {t.game.dailyMovie}
            </Text>

            {/* Buy reveal button */}
            {canBuyFieldReveal && isPlaying && (
              <Pressable
                onPress={onBuyReveal}
                className="flex-row items-center gap-1.5 rounded-full px-2.5 py-1"
                style={({ pressed }) => ({
                  backgroundColor: pressed ? "rgba(124,77,255,0.15)" : "rgba(124,77,255,0.08)",
                })}
              >
                <Ionicons name="bulb-outline" size={12} color="#7c4dff" />
                <Text className="text-[11px] font-sans-bold text-accent">
                  {t.coins.buyHint}
                </Text>
                <Ionicons name="diamond" size={9} color="#ffc107" />
                <Text className="text-[11px] font-sans-bold text-warning">{COST_HINT}</Text>
              </Pressable>
            )}
          </View>

          <View className="flex-row flex-wrap gap-1.5">
            {fields.map((field) => (
              <View
                key={field.key}
                className="flex-row items-center gap-1 rounded-md px-2 py-1"
                style={{
                  backgroundColor: field.value
                    ? field.isBought
                      ? "rgba(124,77,255,0.1)"
                      : "rgba(0,230,118,0.08)"
                    : "rgba(255,255,255,0.03)",
                }}
              >
                <Ionicons
                  name={field.value ? field.icon : "lock-closed-outline"}
                  size={11}
                  color={
                    field.value
                      ? field.isBought ? "#7c4dff" : "#00e676"
                      : "rgba(138,138,154,0.3)"
                  }
                />
                <Text
                  className="text-[11px] font-sans-bold"
                  style={{
                    color: field.value
                      ? field.isBought ? "#7c4dff" : "#e8e8ed"
                      : "rgba(138,138,154,0.3)",
                  }}
                >
                  {field.value ?? field.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

function getPopularityLabel(value: number, t: { popularity: { low: string; medium: string; high: string; veryHigh: string; mega: string } }): string {
  if (value < 20) return t.popularity.low;
  if (value < 50) return t.popularity.medium;
  if (value < 100) return t.popularity.high;
  if (value < 200) return t.popularity.veryHigh;
  return t.popularity.mega;
}
