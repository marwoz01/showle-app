import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "@/i18n";
import { api } from "@/lib/api";
import { GameStateResponse } from "@/lib/api-types";
import GameHistoryItem from "@/components/profile/GameHistoryItem";

const PER_PAGE = 15;

export default function HistoryScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [history, setHistory] = useState<GameStateResponse[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchPage = useCallback(async (p: number) => {
    try {
      const res = await api.game.history(p, PER_PAGE);
      setHistory((prev) => (p === 1 ? res.items : [...prev, ...res.items]));
      setHasMore(res.items.length === PER_PAGE);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(page);
  }, [page]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading) {
      setPage((p) => p + 1);
    }
  }, [hasMore, loading]);

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <GameHistoryItem game={item} />}
        ListHeaderComponent={
          <View className="flex-row items-center gap-3 mb-4">
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <Ionicons name="arrow-back" size={24} color="#e8e8f0" />
            </Pressable>
            <Text className="text-2xl font-heading-bold text-primary">
              {t.profile.gameHistory}
            </Text>
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <View className="items-center py-10">
              <Ionicons name="film-outline" size={32} color="#8a8a9a" />
              <Text className="mt-3 text-sm font-sans-medium text-muted-foreground text-center">
                {t.profile.noGamesYet}
              </Text>
            </View>
          ) : null
        }
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 120,
        }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loading ? (
            <View className="py-4 items-center">
              <ActivityIndicator size="small" color="#7c4dff" />
            </View>
          ) : null
        }
      />
    </View>
  );
}
