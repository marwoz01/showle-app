import { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "@/i18n";
import { searchMovies } from "@/lib/tmdb";
import { api } from "@/lib/api";
import { MediaDetails } from "@/types";
import { CollectionCategory } from "@/lib/api-types";

export default function AddMovie() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string }>();
  const { t } = useTranslation();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MediaDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [category, setCategory] = useState<CollectionCategory>(
    (params.category as CollectionCategory) || "watched",
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchMovies(text);
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAdd = async () => {
    const movies = results.filter((m) => selected.has(m.id));
    if (movies.length === 0) return;

    setSaving(true);
    for (const m of movies) {
      try {
        await api.collection.save({
          tmdbId: m.id,
          title: m.title,
          year: m.year,
          posterPath: m.posterPath,
          genres: m.genres,
          director: m.director,
          overview: m.overview,
          runtime: m.runtime,
          tmdbRating: m.rating,
          category,
        });
      } catch {
        // skip duplicates
      }
    }
    router.back();
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center gap-3 px-4 pb-3 pt-2">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={24} color="#e8e8ed" />
        </Pressable>
        <Text className="flex-1 text-lg font-heading-bold text-primary">
          {t.collections.addMovie}
        </Text>
        {selected.size > 0 && (
          <Pressable
            onPress={handleAdd}
            disabled={saving}
            className="rounded-lg px-4 py-2"
            style={{
              backgroundColor: saving ? "rgba(124,77,255,0.4)" : "#7c4dff",
            }}
          >
            <Text className="text-sm font-heading-semibold text-white">
              {saving ? "..." : `${t.collections.addSelected} (${selected.size})`}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Category selector */}
      <View className="flex-row gap-2 px-4 pb-3">
        {(["watched", "watchlist"] as const).map((cat) => (
          <Pressable
            key={cat}
            onPress={() => setCategory(cat)}
            className="flex-row items-center gap-1.5 rounded-lg px-3 py-2"
            style={{
              backgroundColor:
                category === cat
                  ? "rgba(124,77,255,0.15)"
                  : "rgba(255,255,255,0.05)",
              borderWidth: 1,
              borderColor:
                category === cat ? "rgba(124,77,255,0.4)" : "transparent",
            }}
          >
            <Ionicons
              name={cat === "watched" ? "eye" : "bookmark"}
              size={14}
              color={category === cat ? "#7c4dff" : "#8a8a9a"}
            />
            <Text
              style={{
                color: category === cat ? "#7c4dff" : "#8a8a9a",
                fontSize: 13,
                fontWeight: "600",
              }}
            >
              {cat === "watched"
                ? t.collections.watched
                : t.collections.watchlist}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Search input */}
      <View className="mx-4 mb-3 flex-row items-center rounded-xl border border-border bg-card px-3">
        <Ionicons name="search" size={18} color="#8a8a9a" />
        <TextInput
          value={query}
          onChangeText={handleSearch}
          placeholder={t.collections.searchMovies}
          placeholderTextColor="#555"
          className="ml-2 flex-1 py-3 text-sm font-sans text-primary"
          autoFocus
          returnKeyType="search"
        />
        {query.length > 0 && (
          <Pressable
            onPress={() => {
              setQuery("");
              setResults([]);
            }}
            hitSlop={8}
          >
            <Ionicons name="close-circle" size={18} color="#555" />
          </Pressable>
        )}
        {loading && (
          <ActivityIndicator
            size="small"
            color="#7c4dff"
            style={{ marginLeft: 8 }}
          />
        )}
      </View>

      {/* Results */}
      <FlatList
        data={results}
        keyExtractor={(item) => String(item.id)}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        renderItem={({ item }) => {
          const isSelected = selected.has(item.id);
          return (
            <Pressable
              onPress={() => toggleSelect(item.id)}
              className="mb-2 flex-row items-center gap-3 rounded-2xl border p-3"
              style={{
                backgroundColor: isSelected
                  ? "rgba(124,77,255,0.08)"
                  : "rgba(255,255,255,0.02)",
                borderColor: isSelected
                  ? "rgba(124,77,255,0.3)"
                  : "rgba(255,255,255,0.06)",
              }}
            >
              {/* Checkbox */}
              <View
                className="items-center justify-center rounded-full"
                style={{
                  width: 24,
                  height: 24,
                  borderWidth: 2,
                  borderColor: isSelected ? "#7c4dff" : "#555",
                  backgroundColor: isSelected ? "#7c4dff" : "transparent",
                }}
              >
                {isSelected && (
                  <Ionicons name="checkmark" size={15} color="#fff" />
                )}
              </View>

              {/* Poster */}
              <View
                className="overflow-hidden rounded-lg"
                style={{
                  width: 48,
                  height: 72,
                  backgroundColor: "rgba(255,255,255,0.05)",
                }}
              >
                {item.posterPath ? (
                  <Image
                    source={{
                      uri: `https://image.tmdb.org/t/p/w185${item.posterPath}`,
                    }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                ) : (
                  <View className="flex-1 items-center justify-center">
                    <Ionicons name="film-outline" size={20} color="#8a8a9a" />
                  </View>
                )}
              </View>

              {/* Info */}
              <View className="flex-1">
                <Text
                  className="text-base font-heading-semibold text-primary"
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Text className="mt-0.5 text-xs font-sans-medium text-muted-foreground">
                  {item.year} · {item.director}
                </Text>
                <Text
                  className="mt-0.5 text-xs font-sans text-muted-foreground"
                  numberOfLines={1}
                >
                  {item.genres.slice(0, 3).join(", ")}
                </Text>
              </View>

              {/* Rating */}
              {item.rating > 0 && (
                <View
                  className="flex-row items-center gap-0.5 rounded-md px-1.5 py-0.5"
                  style={{ backgroundColor: "rgba(255,193,7,0.15)" }}
                >
                  <Ionicons name="star" size={11} color="#ffc107" />
                  <Text
                    style={{
                      color: "#ffc107",
                      fontSize: 11,
                      fontWeight: "700",
                    }}
                  >
                    {item.rating}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        }}
        ListEmptyComponent={
          query.length < 2 ? (
            <View className="items-center pt-20">
              <Ionicons
                name="search"
                size={48}
                color="rgba(255,255,255,0.08)"
              />
              <Text className="mt-4 text-center text-sm font-sans text-muted-foreground">
                {t.collections.searchMovies}
              </Text>
            </View>
          ) : !loading ? (
            <Text className="py-12 text-center text-sm font-sans text-muted-foreground">
              No results
            </Text>
          ) : null
        }
      />
    </View>
  );
}
