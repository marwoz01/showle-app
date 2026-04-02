import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { UserStatsResponse } from "@/lib/api-types";
import { useTranslation } from "@/i18n";

interface StatsGridProps {
  stats: UserStatsResponse;
}

export default function StatsGrid({ stats }: StatsGridProps) {
  const { t } = useTranslation();

  const winRate =
    stats.gamesPlayed > 0
      ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
      : 0;

  const items: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
    accent?: boolean;
  }[] = [
    {
      icon: "game-controller-outline",
      label: t.profile.gamesPlayed,
      value: String(stats.gamesPlayed),
    },
    {
      icon: "trophy-outline",
      label: t.profile.gamesWon,
      value: String(stats.gamesWon),
    },
    {
      icon: "stats-chart-outline",
      label: t.profile.winRate,
      value: `${winRate}%`,
      accent: true,
    },
    {
      icon: "flame-outline",
      label: t.profile.currentStreak,
      value: String(stats.currentStreak),
      accent: true,
    },
    {
      icon: "ribbon-outline",
      label: t.profile.maxStreak,
      value: String(stats.maxStreak),
    },
    {
      icon: "locate-outline",
      label: t.profile.averageGuesses,
      value: stats.averageGuesses.toFixed(1),
    },
  ];

  return (
    <View className="flex-row flex-wrap gap-3">
      {items.map((item) => (
        <View
          key={item.label}
          className="items-center gap-1.5 rounded-2xl border border-border bg-card py-4"
          style={{ flexBasis: "30%", flexGrow: 1 }}
        >
          <Ionicons
            name={item.icon}
            size={18}
            color={item.accent ? "#7c4dff" : "#8a8a9a"}
          />
          <Text
            className="text-xl font-heading-bold"
            style={{ color: item.accent ? "#7c4dff" : "#e8e8ed" }}
          >
            {item.value}
          </Text>
          <Text
            className="text-xs font-sans-medium text-muted-foreground"
            numberOfLines={1}
          >
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
