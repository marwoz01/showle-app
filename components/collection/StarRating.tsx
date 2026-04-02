import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface StarRatingProps {
  rating: number; // 0-10 scale
  size?: number;
  onPress?: () => void;
}

export default function StarRating({
  rating,
  size = 16,
  onPress,
}: StarRatingProps) {
  const display = rating % 1 === 0 ? String(rating) : rating.toFixed(1);

  const Wrapper = onPress ? Pressable : View;

  return (
    <Wrapper
      onPress={onPress}
      className="flex-row items-center gap-1 self-start rounded-md px-2 py-1"
      style={{ backgroundColor: "rgba(255,193,7,0.15)" }}
    >
      <Ionicons name="star" size={size} color="#ffc107" />
      <Text style={{ color: "#ffc107", fontSize: size * 0.85, fontWeight: "700" }}>
        {display}
      </Text>
    </Wrapper>
  );
}
