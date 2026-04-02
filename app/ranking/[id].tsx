import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "@/i18n";
import { api } from "@/lib/api";
import { RankedList, RankedListItem } from "@/lib/api-types";
import { searchMovies } from "@/lib/tmdb";
import { MediaDetails } from "@/types";

export default function RankingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();

  const [list, setList] = useState<RankedList | null>(null);
  const [loading, setLoading] = useState(true);
  const [addMode, setAddMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MediaDetails[]>([]);
  const [searching, setSearching] = useState(false);

  const fetchList = useCallback(async () => {
    if (!id) return;
    try {
      const data = await api.rankings.get(id);
      setList(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // ── Search for adding movies ──

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    if (text.length < 2) {
      setSearchResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await searchMovies(text);
        setSearchResults(data);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, []);

  const handleAddMovie = useCallback(
    async (movie: MediaDetails) => {
      if (!id) return;
      try {
        await api.rankings.addItems(id, [
          {
            tmdbId: movie.id,
            title: movie.title,
            year: movie.year,
            posterPath: movie.posterPath,
            genres: movie.genres,
            director: movie.director,
            overview: movie.overview,
          },
        ]);
        setAddMode(false);
        setSearchQuery("");
        setSearchResults([]);
        fetchList();
      } catch {
        // silent
      }
    },
    [id, fetchList],
  );

  // ── Reorder ──

  const handleMoveUp = useCallback(
    async (itemId: string) => {
      if (!list) return;
      const items = [...list.items].sort((a, b) => a.position - b.position);
      const idx = items.findIndex((i) => i.id === itemId);
      if (idx <= 0) return;

      // Swap positions
      const above = items[idx - 1];
      const current = items[idx];
      const newItems = items.map((it) => {
        if (it.id === current.id) return { ...it, position: above.position };
        if (it.id === above.id) return { ...it, position: current.position };
        return it;
      });

      setList({ ...list, items: newItems });
      try {
        await api.rankings.reorder(
          list.id,
          newItems.map((it) => ({ id: it.id, position: it.position })),
        );
      } catch {
        fetchList();
      }
    },
    [list, fetchList],
  );

  const handleMoveDown = useCallback(
    async (itemId: string) => {
      if (!list) return;
      const items = [...list.items].sort((a, b) => a.position - b.position);
      const idx = items.findIndex((i) => i.id === itemId);
      if (idx < 0 || idx >= items.length - 1) return;

      const below = items[idx + 1];
      const current = items[idx];
      const newItems = items.map((it) => {
        if (it.id === current.id) return { ...it, position: below.position };
        if (it.id === below.id) return { ...it, position: current.position };
        return it;
      });

      setList({ ...list, items: newItems });
      try {
        await api.rankings.reorder(
          list.id,
          newItems.map((it) => ({ id: it.id, position: it.position })),
        );
      } catch {
        fetchList();
      }
    },
    [list, fetchList],
  );

  // ── Remove item ──

  const handleRemoveItem = useCallback(
    (itemId: string) => {
      Alert.alert(t.collections.remove, t.collections.confirmDelete, [
        { text: t.collections.cancel, style: "cancel" },
        {
          text: t.collections.remove,
          style: "destructive",
          onPress: async () => {
            if (!list) return;
            setList({
              ...list,
              items: list.items.filter((i) => i.id !== itemId),
            });
            try {
              await api.rankings.removeItem(list.id, itemId);
            } catch {
              fetchList();
            }
          },
        },
      ]);
    },
    [list, fetchList, t],
  );

  // ── Delete list ──

  const handleDeleteList = useCallback(() => {
    Alert.alert(t.collections.deleteList, t.collections.confirmDelete, [
      { text: t.collections.cancel, style: "cancel" },
      {
        text: t.collections.deleteList,
        style: "destructive",
        onPress: async () => {
          if (!id) return;
          try {
            await api.rankings.remove(id);
            router.back();
          } catch {
            // silent
          }
        },
      },
    ]);
  }, [id, router, t]);

  // ── Render ──

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#7c4dff" />
      </View>
    );
  }

  if (!list) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-sm font-sans text-muted-foreground">
          {t.collections.loadError}
        </Text>
      </View>
    );
  }

  const sortedItems = [...list.items].sort((a, b) => a.position - b.position);

  const renderItem = ({ item, index }: { item: RankedListItem; index: number }) => (
    <View className="mx-4 mb-2 flex-row items-center gap-3 rounded-xl border border-border bg-card p-3">
      {/* Position */}
      <Text
        className="text-center font-heading-bold"
        style={{ width: 24, color: index < 3 ? "#7c4dff" : "#8a8a9a", fontSize: 16 }}
      >
        {index + 1}
      </Text>

      {/* Poster */}
      <View
        className="overflow-hidden rounded-lg"
        style={{ width: 40, height: 60, backgroundColor: "rgba(255,255,255,0.05)" }}
      >
        {item.posterPath ? (
          <Image
            source={{ uri: `https://image.tmdb.org/t/p/w92${item.posterPath}` }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Ionicons name="film-outline" size={16} color="#8a8a9a" />
          </View>
        )}
      </View>

      {/* Info */}
      <View className="flex-1">
        <Text className="text-sm font-heading-semibold text-primary" numberOfLines={1}>
          {item.title}
        </Text>
        <Text className="text-xs font-sans text-muted-foreground">
          {item.year} · {item.director}
        </Text>
      </View>

      {/* Reorder + delete */}
      <View className="items-center gap-0.5">
        <Pressable onPress={() => handleMoveUp(item.id)} hitSlop={8}>
          <Ionicons
            name="chevron-up"
            size={18}
            color={index > 0 ? "#8a8a9a" : "rgba(255,255,255,0.1)"}
          />
        </Pressable>
        <Pressable onPress={() => handleMoveDown(item.id)} hitSlop={8}>
          <Ionicons
            name="chevron-down"
            size={18}
            color={index < sortedItems.length - 1 ? "#8a8a9a" : "rgba(255,255,255,0.1)"}
          />
        </Pressable>
      </View>

      <Pressable onPress={() => handleRemoveItem(item.id)} hitSlop={8}>
        <Ionicons name="close-circle-outline" size={20} color="#ff5252" />
      </Pressable>
    </View>
  );

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center gap-3 px-4 pb-3 pt-2">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color="#e8e8ed" />
        </Pressable>
        <View className="flex-1">
          <Text className="text-lg font-heading-bold text-primary" numberOfLines={1}>
            {list.name}
          </Text>
          {list.description && (
            <Text className="text-xs font-sans text-muted-foreground" numberOfLines={1}>
              {list.description}
            </Text>
          )}
        </View>
        <Pressable
          onPress={() => setAddMode(!addMode)}
          className="rounded-lg px-3 py-1.5"
          style={{ backgroundColor: "rgba(124,77,255,0.15)" }}
        >
          <Ionicons name={addMode ? "close" : "add"} size={18} color="#7c4dff" />
        </Pressable>
        <Pressable onPress={handleDeleteList} hitSlop={8}>
          <Ionicons name="trash-outline" size={20} color="#ff5252" />
        </Pressable>
      </View>

      {/* Add movie search */}
      {addMode && (
        <View className="border-b border-border px-4 pb-3">
          <View className="flex-row items-center rounded-xl border border-border bg-card px-3">
            <Ionicons name="search" size={18} color="#8a8a9a" />
            <TextInput
              value={searchQuery}
              onChangeText={handleSearch}
              placeholder={t.collections.searchMovies}
              placeholderTextColor="#555"
              className="ml-2 flex-1 py-3 text-sm font-sans text-primary"
              autoFocus
            />
            {searching && <ActivityIndicator size="small" color="#7c4dff" />}
          </View>

          {searchResults.length > 0 && (
            <View className="mt-2" style={{ maxHeight: 200 }}>
              <FlatList
                data={searchResults}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => handleAddMovie(item)}
                    className="flex-row items-center gap-2 rounded-lg px-2 py-2"
                  >
                    <View
                      className="overflow-hidden rounded"
                      style={{ width: 28, height: 42, backgroundColor: "rgba(255,255,255,0.05)" }}
                    >
                      {item.posterPath && (
                        <Image
                          source={{ uri: `https://image.tmdb.org/t/p/w92${item.posterPath}` }}
                          style={{ width: "100%", height: "100%" }}
                          contentFit="cover"
                        />
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-sans-medium text-primary" numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text className="text-xs font-sans text-muted-foreground">
                        {item.year} · {item.director}
                      </Text>
                    </View>
                    <Ionicons name="add-circle-outline" size={22} color="#7c4dff" />
                  </Pressable>
                )}
              />
            </View>
          )}
        </View>
      )}

      {/* Items */}
      <FlatList
        data={sortedItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 40 }}
        ListEmptyComponent={
          <Text className="px-4 py-12 text-center text-sm font-sans text-muted-foreground">
            {t.collections.emptyList}
          </Text>
        }
      />
    </View>
  );
}
