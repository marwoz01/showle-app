import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { UserStatsResponse, CollectionStatsResponse } from "@/lib/api-types";
import { useTranslation } from "@/i18n";

interface StatItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  accent?: boolean;
}

function StatCard({ item }: { item: StatItem }) {
  return (
    <View
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
        className="text-xs font-sans-medium text-muted-foreground text-center px-1"
        numberOfLines={1}
      >
        {item.label}
      </Text>
    </View>
  );
}

interface StatsGridProps {
  stats: UserStatsResponse;
  collectionStats?: CollectionStatsResponse | null;
}

export default function StatsGrid({ stats, collectionStats }: StatsGridProps) {
  const { t } = useTranslation();

  const winRate =
    stats.gamesPlayed > 0
      ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
      : 0;

  const gameItems: StatItem[] = [
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
  ];

  const collectionItems: StatItem[] = collectionStats
    ? [
        {
          icon: "film-outline",
          label: t.profile.moviesWatched,
          value: String(collectionStats.totalMovies),
        },
        {
          icon: "time-outline",
          label: t.profile.hoursWatched,
          value: String(collectionStats.totalHours),
        },
        ...(collectionStats.favoriteGenre
          ? [
              {
                icon: "heart-outline" as keyof typeof Ionicons.glyphMap,
                label: t.profile.favoriteGenre,
                value: collectionStats.favoriteGenre,
                accent: true,
              },
            ]
          : []),
      ]
    : [];

  return (
    <View className="gap-3">
      {/* Game stats */}
      <View className="flex-row flex-wrap gap-3">
        {gameItems.map((item) => (
          <StatCard key={item.label} item={item} />
        ))}
      </View>

      {/* Collection stats */}
      {collectionItems.length > 0 && (
        <View className="flex-row flex-wrap gap-3">
          {collectionItems.map((item) => (
            <StatCard key={item.label} item={item} />
          ))}
        </View>
      )}
    </View>
  );
}
