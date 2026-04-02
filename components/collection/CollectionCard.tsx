import { View, Text, Pressable, Alert, ActionSheetIOS, Platform } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { SavedMovie } from "@/lib/api-types";
import { useTranslation } from "@/i18n";
import StarRating from "./StarRating";

interface CollectionCardProps {
  movie: SavedMovie;
  onRate?: (id: string, rating: number) => void;
  onReview?: (movie: SavedMovie) => void;
  onMove?: (id: string, category: "watched" | "watchlist") => void;
  onRemove?: (id: string) => void;
}

export default function CollectionCard({
  movie,
  onRate,
  onReview,
  onMove,
  onRemove,
}: CollectionCardProps) {
  const { t } = useTranslation();
  const isWatched = movie.category === "watched";

  const handleMove = () => {
    const target = isWatched ? "watchlist" : "watched";
    const label = isWatched ? t.collections.moveToWatchlist : t.collections.moveToWatched;
    Alert.alert(label, `${movie.title} (${movie.year})`, [
      { text: t.collections.cancel, style: "cancel" },
      {
        text: label,
        onPress: () => onMove?.(movie.id, target),
      },
    ]);
  };

  const handleRemove = () => {
    Alert.alert(t.collections.remove, t.collections.confirmDeleteMovie, [
      { text: t.collections.cancel, style: "cancel" },
      {
        text: t.collections.remove,
        style: "destructive",
        onPress: () => onRemove?.(movie.id),
      },
    ]);
  };

  const date = movie.watchedAt
    ? new Date(movie.watchedAt).toLocaleDateString()
    : new Date(movie.createdAt).toLocaleDateString();

  return (
    <View className="flex-row gap-3 rounded-2xl border border-border bg-card p-3">
      {/* Poster */}
      <Pressable
        className="overflow-hidden rounded-xl"
        style={{
          width: 80,
          height: 120,
          backgroundColor: "rgba(255,255,255,0.05)",
        }}
      >
        {movie.posterPath ? (
          <Image
            source={{
              uri: `https://image.tmdb.org/t/p/w342${movie.posterPath}`,
            }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Ionicons name="film-outline" size={28} color="#8a8a9a" />
          </View>
        )}
      </Pressable>

      {/* Info */}
      <View className="flex-1 justify-between">
        <View>
          <Text
            className="text-base font-heading-semibold text-primary"
            numberOfLines={1}
          >
            {movie.title}
          </Text>
          <Text className="mt-0.5 text-xs font-sans-medium text-muted-foreground">
            {movie.year} · {movie.director} · {date}
          </Text>
          {movie.genres.length > 0 && (
            <Text
              className="mt-1 text-xs font-sans text-muted-foreground"
              numberOfLines={1}
            >
              {movie.genres.join(", ")}
            </Text>
          )}
        </View>

        {/* Rating (watched only) */}
        {isWatched && movie.rating != null && movie.rating > 0 && (
          <View className="mt-2">
            <StarRating
              rating={movie.rating}
              size={14}
              onPress={() => onRate?.(movie.id, movie.rating ?? 0)}
            />
          </View>
        )}

        {/* Review snippet */}
        {movie.review && (
          <Pressable onPress={() => onReview?.(movie)} className="mt-1.5">
            <Text
              className="text-xs font-sans text-muted-foreground italic"
              numberOfLines={2}
            >
              "{movie.review}"
            </Text>
          </Pressable>
        )}

        {/* Action buttons */}
        <View className="mt-2 flex-row items-center gap-3">
          {isWatched ? (
            <Pressable
              onPress={handleMove}
              hitSlop={6}
              className="flex-row items-center gap-1"
            >
              <Ionicons name="bookmark-outline" size={14} color="#8a8a9a" />
              <Text className="text-xs font-sans-medium text-muted-foreground">
                {t.collections.moveToWatchlist}
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={handleMove}
              hitSlop={6}
              className="flex-row items-center gap-1"
            >
              <Ionicons name="eye-outline" size={14} color="#8a8a9a" />
              <Text className="text-xs font-sans-medium text-muted-foreground">
                {t.collections.moveToWatched}
              </Text>
            </Pressable>
          )}

          <Pressable onPress={handleRemove} hitSlop={6} className="ml-auto">
            <Ionicons name="trash-outline" size={15} color="#ff5252" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
