import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "@/i18n";
import { api } from "@/lib/api";
import { UserStatsResponse, GameStateResponse } from "@/lib/api-types";
import ProfileHeader from "@/components/profile/ProfileHeader";
import StatsGrid from "@/components/profile/StatsGrid";
import GameHistoryItem from "@/components/profile/GameHistoryItem";

const PER_PAGE = 10;

export default function ProfileScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [stats, setStats] = useState<UserStatsResponse | null>(null);
  const [history, setHistory] = useState<GameStateResponse[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const fetchData = useCallback(
    async (refresh = false) => {
      try {
        const currentPage = refresh ? 1 : page;
        const [statsRes, historyRes] = await Promise.all([
          api.user.stats(),
          api.game.history(currentPage, PER_PAGE),
        ]);

        setStats(statsRes);
        if (refresh) {
          setHistory(historyRes.items);
          setPage(1);
        } else {
          setHistory((prev) =>
            currentPage === 1 ? historyRes.items : [...prev, ...historyRes.items],
          );
        }
        setHasMore(historyRes.items.length === PER_PAGE);
        setError(false);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page],
  );

  useEffect(() => {
    fetchData();
  }, [page]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(true);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading) {
      setPage((p) => p + 1);
    }
  }, [hasMore, loading]);

  const renderHeader = () => (
    <View className="gap-6 pb-4">
      <ProfileHeader />

      {stats && <StatsGrid stats={stats} />}

      {/* History header */}
      <View className="flex-row items-center gap-2">
        <Ionicons name="time-outline" size={18} color="#8a8a9a" />
        <Text className="text-lg font-heading-semibold text-primary">
          {t.profile.gameHistory}
        </Text>
      </View>
    </View>
  );

  if (loading && history.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#7c4dff" />
      </View>
    );
  }

  if (error && history.length === 0) {
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
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <GameHistoryItem game={item} />}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View className="items-center py-10 px-6">
            <Ionicons name="film-outline" size={32} color="#8a8a9a" />
            <Text className="mt-3 text-sm font-sans-medium text-muted-foreground text-center">
              {t.profile.noGamesYet}
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingHorizontal: 20,
          paddingBottom: 120,
        }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#7c4dff"
          />
        }
        ListFooterComponent={
          loading && history.length > 0 ? (
            <View className="py-4 items-center">
              <ActivityIndicator size="small" color="#7c4dff" />
            </View>
          ) : null
        }
      />
    </View>
  );
}
