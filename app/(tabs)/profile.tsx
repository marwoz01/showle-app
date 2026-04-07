import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "@/i18n";
import { api } from "@/lib/api";
import { UserStatsResponse, GameStateResponse, CollectionStatsResponse } from "@/lib/api-types";
import ProfileHeader from "@/components/profile/ProfileHeader";
import StatsGrid from "@/components/profile/StatsGrid";
import GameHistoryItem from "@/components/profile/GameHistoryItem";
import CoinBadge from "@/components/shared/CoinBadge";

const PREVIEW_COUNT = 5;

export default function ProfileScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signOut } = useAuth();

  const [stats, setStats] = useState<UserStatsResponse | null>(null);
  const [collectionStats, setCollectionStats] = useState<CollectionStatsResponse | null>(null);
  const [history, setHistory] = useState<GameStateResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, historyRes, colRes] = await Promise.all([
        api.user.stats(),
        api.game.history(1, PREVIEW_COUNT),
        api.collection.list("watched", "date", 1, 200).catch(() => null),
      ]);
      setStats(statsRes);
      setHistory(historyRes.items);

      if (colRes && colRes.items.length > 0) {
        const totalMovies = colRes.total;
        const totalMinutes = colRes.items.reduce((sum, m) => sum + (m.runtime || 0), 0);
        const totalHours = Math.round(totalMinutes / 60);
        const genreCounts: Record<string, number> = {};
        for (const m of colRes.items) {
          for (const g of m.genres) {
            genreCounts[g] = (genreCounts[g] || 0) + 1;
          }
        }
        const favoriteGenre = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
        setCollectionStats({ totalMovies, totalHours, totalMinutes, favoriteGenre });
      }

      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#7c4dff" />
      </View>
    );
  }

  if (error) {
    return (
      <View
        className="flex-1 items-center justify-center bg-background px-6"
        style={{ paddingTop: insets.top }}
      >
        <Ionicons name="cloud-offline-outline" size={48} color="#8a8a9a" />
        <Text className="mt-4 text-sm font-sans-medium text-muted-foreground text-center">
          {t.profile.loadError}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 24,
          paddingHorizontal: 20,
          paddingBottom: 120,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#7c4dff"
          />
        }
      >
        {/* Profile header — centered */}
        <ProfileHeader />

        {/* Coin badge — centered below header */}
        <View className="items-center mt-4">
          <CoinBadge />
        </View>

        {/* Stats */}
        {stats && (
          <View className="mt-6">
            <StatsGrid stats={stats} collectionStats={collectionStats} />
          </View>
        )}

        {/* Recent games */}
        <View className="mt-6">
          <View className="flex-row items-center gap-2 mb-3">
            <Ionicons name="time-outline" size={18} color="#8a8a9a" />
            <Text className="text-lg font-heading-semibold text-primary">
              {t.profile.gameHistory}
            </Text>
          </View>

          {history.length === 0 ? (
            <View className="items-center py-8">
              <Ionicons name="film-outline" size={32} color="#8a8a9a" />
              <Text className="mt-3 text-sm font-sans-medium text-muted-foreground text-center">
                {t.profile.noGamesYet}
              </Text>
            </View>
          ) : (
            <View className="gap-2">
              {history.map((game) => (
                <GameHistoryItem key={game.id} game={game} />
              ))}
            </View>
          )}

          {/* View full history */}
          {history.length > 0 && (
            <Pressable
              onPress={() => router.push("/history")}
              className="mt-3 flex-row items-center justify-center gap-2 rounded-xl border border-border py-3"
            >
              <Text className="text-sm font-sans-semibold text-accent">
                {t.profile.viewFullHistory}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#7c4dff" />
            </Pressable>
          )}
        </View>

        {/* Sign out */}
        <Pressable
          onPress={() => signOut()}
          className="mt-8 flex-row items-center justify-center gap-2 rounded-xl border border-destructive/30 py-3.5"
        >
          <Ionicons name="log-out-outline" size={18} color="#ff5252" />
          <Text className="text-sm font-sans-semibold text-destructive">
            {t.profile.signOut}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
