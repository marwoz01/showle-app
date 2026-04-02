import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  FlatList,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MediaDetails } from "@/types";
import { useTranslation } from "@/i18n";
import { searchMovies } from "@/lib/tmdb";

interface SearchBarProps {
  onSelect: (movie: MediaDetails) => void;
  disabled?: boolean;
}

export default function SearchBar({ onSelect, disabled }: SearchBarProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MediaDetails[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        const data = await searchMovies(query);
        if (!cancelled) {
          setResults(data);
          setIsOpen(data.length > 0);
        }
      } catch {
        if (!cancelled) {
          setResults([]);
          setIsOpen(false);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  function handleSelect(movie: MediaDetails) {
    onSelect(movie);
    setQuery("");
    setResults([]);
    setIsOpen(false);
    Keyboard.dismiss();
  }

  return (
    <View>
      {/* Input */}
      <View className="flex-row items-center rounded-2xl border border-border bg-card px-4" style={{ height: 52 }}>
        {isLoading ? (
          <ActivityIndicator size="small" color="#7c4dff" />
        ) : (
          <Ionicons name="search" size={20} color="#8a8a9a" />
        )}
        <TextInput
          ref={inputRef}
          placeholder={t.game.searchPlaceholder}
          placeholderTextColor="#8a8a9a"
          value={query}
          onChangeText={setQuery}
          editable={!disabled}
          className="ml-3 flex-1 text-base font-sans-medium text-primary"
          autoCorrect={false}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <Pressable onPress={() => { setQuery(""); setResults([]); setIsOpen(false); }}>
            <Ionicons name="close-circle" size={20} color="#8a8a9a" />
          </Pressable>
        )}
      </View>

      {/* Dropdown */}
      {isOpen && (
        <View className="mt-2 rounded-2xl border border-border overflow-hidden" style={{ backgroundColor: "#1a1a1d" }}>
          <FlatList
            data={results}
            keyExtractor={(item) => String(item.id)}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={false}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleSelect(item)}
                className="flex-row items-center px-4 py-3.5 border-b border-border"
                style={({ pressed }) => [pressed && { backgroundColor: "rgba(124,77,255,0.1)" }]}
              >
                <View className="flex-1">
                  <Text className="text-base font-sans-medium text-primary">
                    {item.title}
                  </Text>
                  <Text className="mt-0.5 text-xs font-sans-medium text-muted-foreground">
                    {item.year} · {item.director}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#8a8a9a" />
              </Pressable>
            )}
          />
        </View>
      )}
    </View>
  );
}
