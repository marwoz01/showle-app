import { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { useTranslation } from "@/i18n";
import { api } from "@/lib/api";
import {
  SavedMovie,
  CollectionCategory,
  CollectionSort,
  RankedList,
} from "@/lib/api-types";
import CollectionCard from "@/components/collection/CollectionCard";
import ReviewModal from "@/components/collection/ReviewModal";

type Tab = "watched" | "watchlist" | "rankings";

const SORT_OPTIONS: { key: CollectionSort; icon: string }[] = [
  { key: "date", icon: "time-outline" },
  { key: "rating", icon: "star-outline" },
  { key: "title", icon: "text-outline" },
  { key: "year", icon: "calendar-outline" },
];

export default function Collections() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();

  const [tab, setTab] = useState<Tab>("watched");
  const [sort, setSort] = useState<CollectionSort>("date");
  const [movies, setMovies] = useState<SavedMovie[]>([]);
  const [rankings, setRankings] = useState<RankedList[]>([]);
  const [counts, setCounts] = useState({ watched: 0, watchlist: 0, rankings: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Modals
  const [reviewModal, setReviewModal] = useState<{
    visible: boolean;
    movie: SavedMovie | null;
  }>({ visible: false, movie: null });

  // Refs to avoid stale closures
  const tabRef = useRef(tab);
  tabRef.current = tab;
  const sortRef = useRef(sort);
  sortRef.current = sort;

  // ── Fetch ──

  const fetchMovies = useCallback(
    async (p: number, reset = false) => {
      if (tab === "rankings") return;
      try {
        const category = tab as CollectionCategory;
        const res = await api.collection.list(category, sort, p, 20);
        setMovies((prev) => (reset ? res.items : [...prev, ...res.items]));
        setHasMore(res.items.length === 20);
        setCounts((c) => ({ ...c, [category]: res.total }));
      } catch {
        // silent
      }
    },
    [tab, sort],
  );

  const fetchRankings = useCallback(async () => {
    try {
      const res = await api.rankings.list();
      setRankings(res);
      setCounts((c) => ({ ...c, rankings: res.length }));
    } catch {
      // silent
    }
  }, []);

  const fetchCounts = useCallback(async () => {
    try {
      const [w, wl, r] = await Promise.all([
        api.collection.list("watched", "date", 1, 1),
        api.collection.list("watchlist", "date", 1, 1),
        api.rankings.list(),
      ]);
      setCounts({ watched: w.total, watchlist: wl.total, rankings: r.length });
    } catch {
      // silent
    }
  }, []);

  const loadData = useCallback(
    async (reset = true) => {
      if (reset) {
        setPage(1);
        setHasMore(true);
      }
      if (tab === "rankings") {
        await fetchRankings();
      } else {
        await fetchMovies(1, true);
      }
    },
    [tab, fetchMovies, fetchRankings],
  );

  useEffect(() => {
    setLoading(true);
    setMovies([]);
    loadData().finally(() => setLoading(false));
  }, [tab, sort]);

  // Refresh when screen gains focus (e.g. returning from add-movie)
  useFocusEffect(
    useCallback(() => {
      loadData();
      fetchCounts();
    }, [loadData, fetchCounts]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadData(), fetchCounts()]);
    setRefreshing(false);
  }, [loadData, fetchCounts]);

  const onEndReached = useCallback(async () => {
    if (loadingMore || !hasMore || tab === "rankings") return;
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchMovies(nextPage);
    setLoadingMore(false);
  }, [loadingMore, hasMore, page, tab, fetchMovies]);

  // ── Actions ──

  const handleRate = useCallback(async (id: string, rating: number) => {
    setMovies((prev) =>
      prev.map((m) => (m.id === id ? { ...m, rating } : m)),
    );
    try {
      await api.collection.update(id, { rating });
    } catch {
      // revert
    }
  }, []);

  const handleMove = useCallback(
    async (id: string, category: CollectionCategory) => {
      setMovies((prev) => prev.filter((m) => m.id !== id));
      setCounts((c) => {
        const from = category === "watched" ? "watchlist" : "watched";
        return { ...c, [from]: c[from] - 1, [category]: c[category] + 1 };
      });
      try {
        await api.collection.update(id, { category });
      } catch {
        // revert on next refresh
      }
    },
    [],
  );

  const handleRemove = useCallback(
    async (id: string) => {
      setMovies((prev) => prev.filter((m) => m.id !== id));
      setCounts((c) => ({ ...c, [tabRef.current]: c[tabRef.current as keyof typeof c] as number - 1 }));
      try {
        await api.collection.remove(id);
      } catch {
        // revert on next refresh
      }
    },
    [],
  );

  const handleSaveReview = useCallback(
    async (review: string) => {
      if (!reviewModal.movie) return;
      const id = reviewModal.movie.id;
      setMovies((prev) =>
        prev.map((m) => (m.id === id ? { ...m, review } : m)),
      );
      setReviewModal({ visible: false, movie: null });
      try {
        await api.collection.update(id, { review });
      } catch {
        // revert on next refresh
      }
    },
    [reviewModal.movie],
  );


  // ── Tabs config ──

  const tabs: { key: Tab; label: string; icon: string; count: number }[] = [
    { key: "watched", label: t.collections.watched, icon: "eye", count: counts.watched },
    { key: "watchlist", label: t.collections.watchlist, icon: "bookmark", count: counts.watchlist },
    { key: "rankings", label: t.collections.rankings, icon: "trophy", count: counts.rankings },
  ];

  // ── Render ──

  const renderMovieItem = useCallback(
    ({ item }: { item: SavedMovie }) => (
      <View className="px-4 pb-3">
        <CollectionCard
          movie={item}
          onRate={handleRate}
          onReview={(m) => setReviewModal({ visible: true, movie: m })}
          onMove={handleMove}
          onRemove={handleRemove}
        />
      </View>
    ),
    [handleRate, handleMove, handleRemove],
  );

  const renderRankingItem = useCallback(
    ({ item }: { item: RankedList }) => (
      <Pressable
        onPress={() => router.push(`/ranking/${item.id}`)}
        className="mx-4 mb-3 rounded-2xl border border-border bg-card p-4"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-base font-heading-semibold text-primary" numberOfLines={1}>
              {item.name}
            </Text>
            {item.description && (
              <Text className="mt-0.5 text-xs font-sans text-muted-foreground" numberOfLines={2}>
                {item.description}
              </Text>
            )}
            <Text className="mt-1 text-xs font-sans-medium text-muted-foreground">
              {item._count?.items ?? item.items?.length ?? 0} {t.collections.items}
            </Text>
          </View>

          {/* Poster previews */}
          <View className="ml-3 flex-row">
            {(item.items ?? []).slice(0, 3).map((it, idx) => (
              <View
                key={it.id}
                className="overflow-hidden rounded-lg border border-background"
                style={{
                  width: 32,
                  height: 48,
                  marginLeft: idx > 0 ? -8 : 0,
                  zIndex: 3 - idx,
                  backgroundColor: "rgba(255,255,255,0.05)",
                }}
              >
                {it.posterPath ? (
                  <Image
                    source={{
                      uri: `https://image.tmdb.org/t/p/w92${it.posterPath}`,
                    }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                ) : null}
              </View>
            ))}
          </View>

          <Ionicons
            name="chevron-forward"
            size={18}
            color="#8a8a9a"
            style={{ marginLeft: 8 }}
          />
        </View>
      </Pressable>
    ),
    [router, t],
  );

  const ListHeader = () => (
    <>
      {/* Tabs */}
      <View className="mb-3 flex-row gap-2 px-4">
        {tabs.map((item) => {
          const active = tab === item.key;
          return (
            <Pressable
              key={item.key}
              onPress={() => setTab(item.key)}
              className="flex-row items-center gap-1.5 rounded-xl px-4 py-2.5"
              style={{
                backgroundColor: active
                  ? "rgba(124,77,255,0.15)"
                  : "rgba(255,255,255,0.05)",
                borderWidth: 1,
                borderColor: active ? "rgba(124,77,255,0.3)" : "transparent",
              }}
            >
              <Ionicons
                name={item.icon as any}
                size={15}
                color={active ? "#7c4dff" : "#8a8a9a"}
              />
              {active && (
                <Text
                  style={{
                    color: "#7c4dff",
                    fontSize: 13,
                    fontWeight: "600",
                  }}
                >
                  {item.label}
                </Text>
              )}
              <View
                className="rounded-full px-1.5"
                style={{
                  backgroundColor: active
                    ? "rgba(124,77,255,0.25)"
                    : "rgba(255,255,255,0.08)",
                }}
              >
                <Text
                  style={{
                    color: active ? "#b47cff" : "#8a8a9a",
                    fontSize: 11,
                    fontWeight: "700",
                  }}
                >
                  {item.count}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Add button */}
      <Pressable
        onPress={() =>
          tab === "rankings"
            ? router.push("/ranking/new")
            : router.push("/add-movie")
        }
        className="mx-4 mb-3 flex-row items-center justify-center gap-1.5 rounded-xl border border-dashed py-2.5"
        style={{ borderColor: "rgba(124,77,255,0.3)" }}
      >
        <Ionicons name="add-circle-outline" size={18} color="#7c4dff" />
        <Text style={{ color: "#7c4dff", fontSize: 13, fontWeight: "600" }}>
          {tab === "rankings" ? t.collections.newList : t.collections.addMovie}
        </Text>
      </Pressable>

      {/* Sort (only for watched/watchlist) */}
      {tab !== "rankings" && (
        <View className="mb-3 flex-row items-center gap-1.5 px-4">
          <Text className="mr-1 text-xs font-sans-medium text-muted-foreground">
            {t.collections.sortBy}:
          </Text>
          {SORT_OPTIONS.filter(
            (s) => tab === "watched" || s.key !== "rating",
          ).map((s) => {
            const active = sort === s.key;
            return (
              <Pressable
                key={s.key}
                onPress={() => setSort(s.key)}
                className="flex-row items-center gap-1 rounded-lg px-2.5 py-1.5"
                style={{
                  backgroundColor: active
                    ? "rgba(124,77,255,0.15)"
                    : "rgba(255,255,255,0.05)",
                }}
              >
                <Text
                  style={{
                    color: active ? "#7c4dff" : "#8a8a9a",
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  {t.collections[s.key === "title" ? "titleSort" : s.key]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </>
  );

  const emptyMessage =
    tab === "watched"
      ? t.collections.noMovies
      : tab === "watchlist"
        ? t.collections.noWatchlist
        : t.collections.noRankings;

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-4 pb-3 pt-2">
        <Text className="text-2xl font-heading-bold text-primary">
          {t.collections.title}
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#7c4dff" />
        </View>
      ) : tab === "rankings" ? (
        <FlatList
          data={rankings}
          keyExtractor={(item) => item.id}
          renderItem={renderRankingItem}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <Text className="px-4 py-12 text-center text-sm font-sans text-muted-foreground">
              {emptyMessage}
            </Text>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#7c4dff"
            />
          }
        />
      ) : (
        <FlatList
          data={movies}
          keyExtractor={(item) => item.id}
          renderItem={renderMovieItem}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <Text className="px-4 py-12 text-center text-sm font-sans text-muted-foreground">
              {emptyMessage}
            </Text>
          }
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                size="small"
                color="#7c4dff"
                style={{ paddingVertical: 16 }}
              />
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#7c4dff"
            />
          }
        />
      )}

      {/* Modals */}
      <ReviewModal
        visible={reviewModal.visible}
        initialReview={reviewModal.movie?.review ?? ""}
        movieTitle={reviewModal.movie?.title ?? ""}
        onSave={handleSaveReview}
        onClose={() => setReviewModal({ visible: false, movie: null })}
      />
    </View>
  );
}

