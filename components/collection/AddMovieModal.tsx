import {
  View,
  Text,
  Pressable,
  TextInput,
  Modal,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useState, useCallback, useRef } from "react";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "@/i18n";
import { searchMovies } from "@/lib/tmdb";
import { MediaDetails } from "@/types";
import { CollectionCategory } from "@/lib/api-types";

interface AddMovieModalProps {
  visible: boolean;
  onAdd: (
    movies: MediaDetails[],
    category: CollectionCategory,
  ) => void;
  onClose: () => void;
}

export default function AddMovieModal({
  visible,
  onAdd,
  onClose,
}: AddMovieModalProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MediaDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [category, setCategory] = useState<CollectionCategory>("watched");
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

  const handleAdd = () => {
    const movies = results.filter((m) => selected.has(m.id));
    if (movies.length === 0) return;
    onAdd(movies, category);
    handleClose();
  };

  const handleClose = () => {
    setQuery("");
    setResults([]);
    setSelected(new Set());
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-end bg-black/60">
        <View
          className="rounded-t-3xl border-t border-border bg-card px-5 pb-8 pt-5"
          style={{ maxHeight: "85%" }}
        >
          <View className="mb-1 h-1 w-10 self-center rounded-full bg-border" />

          <Text className="mt-3 text-lg font-heading-bold text-primary">
            {t.collections.addMovie}
          </Text>

          {/* Category selector */}
          <View className="mt-3 flex-row gap-2">
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
                    category === cat
                      ? "rgba(124,77,255,0.4)"
                      : "transparent",
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
          <View className="mt-3 flex-row items-center rounded-xl border border-border bg-background px-3">
            <Ionicons name="search" size={18} color="#8a8a9a" />
            <TextInput
              value={query}
              onChangeText={handleSearch}
              placeholder={t.collections.searchMovies}
              placeholderTextColor="#555"
              className="ml-2 flex-1 py-3 text-sm font-sans text-primary"
              autoFocus
            />
            {loading && <ActivityIndicator size="small" color="#7c4dff" />}
          </View>

          {/* Results */}
          <FlatList
            data={results}
            keyExtractor={(item) => String(item.id)}
            className="mt-3"
            style={{ flexGrow: 0 }}
            renderItem={({ item }) => {
              const isSelected = selected.has(item.id);
              return (
                <Pressable
                  onPress={() => toggleSelect(item.id)}
                  className="flex-row items-center gap-3 rounded-xl px-2 py-2"
                  style={{
                    backgroundColor: isSelected
                      ? "rgba(124,77,255,0.1)"
                      : "transparent",
                  }}
                >
                  {/* Checkbox */}
                  <View
                    className="items-center justify-center rounded-md"
                    style={{
                      width: 22,
                      height: 22,
                      borderWidth: 1.5,
                      borderColor: isSelected ? "#7c4dff" : "#555",
                      backgroundColor: isSelected
                        ? "#7c4dff"
                        : "transparent",
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
                      width: 36,
                      height: 54,
                      backgroundColor: "rgba(255,255,255,0.05)",
                    }}
                  >
                    {item.posterPath ? (
                      <Image
                        source={{
                          uri: `https://image.tmdb.org/t/p/w92${item.posterPath}`,
                        }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                      />
                    ) : (
                      <View className="flex-1 items-center justify-center">
                        <Ionicons
                          name="film-outline"
                          size={16}
                          color="#8a8a9a"
                        />
                      </View>
                    )}
                  </View>

                  {/* Info */}
                  <View className="flex-1">
                    <Text
                      className="text-sm font-heading-semibold text-primary"
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    <Text className="text-xs font-sans text-muted-foreground">
                      {item.year} · {item.director}
                    </Text>
                  </View>
                </Pressable>
              );
            }}
            ListEmptyComponent={
              query.length >= 2 && !loading ? (
                <Text className="py-8 text-center text-sm font-sans text-muted-foreground">
                  No results
                </Text>
              ) : null
            }
          />

          {/* Actions */}
          <View className="mt-4 flex-row gap-3">
            <Pressable
              onPress={handleClose}
              className="flex-1 items-center rounded-xl border border-border py-3"
            >
              <Text className="text-sm font-heading-semibold text-muted-foreground">
                {t.collections.cancel}
              </Text>
            </Pressable>
            <Pressable
              onPress={handleAdd}
              className="flex-1 items-center rounded-xl py-3"
              style={{
                backgroundColor:
                  selected.size > 0 ? "#7c4dff" : "rgba(124,77,255,0.3)",
              }}
              disabled={selected.size === 0}
            >
              <Text className="text-sm font-heading-semibold text-white">
                {t.collections.addSelected}
                {selected.size > 0 ? ` (${selected.size})` : ""}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
