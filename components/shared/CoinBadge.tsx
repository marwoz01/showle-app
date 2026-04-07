import { useEffect, useRef, useState } from "react";
import { Pressable, Text } from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useWallet } from "@/hooks/useWallet";

interface CoinBadgeProps {
  size?: "sm" | "md";
}

export default function CoinBadge({ size = "md" }: CoinBadgeProps) {
  const { balance } = useWallet();
  const router = useRouter();
  const [displayedBalance, setDisplayedBalance] = useState(balance);
  const prevBalance = useRef(balance);
  const scale = useSharedValue(1);

  useEffect(() => {
    const from = prevBalance.current;
    const to = balance;
    prevBalance.current = balance;

    if (from === to) {
      setDisplayedBalance(to);
      return;
    }

    const diff = to - from;
    const steps = Math.min(Math.abs(diff), 20);
    const stepDuration = 600 / steps;

    for (let i = 1; i <= steps; i++) {
      setTimeout(() => {
        setDisplayedBalance(Math.round(from + (i / steps) * diff));

        // Pulse at the end
        if (i === steps) {
          scale.value = withSequence(
            withTiming(1.25, { duration: 120 }),
            withTiming(1, { duration: 150 }),
          );
        }
      }, i * stepDuration);
    }
  }, [balance]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconSize = size === "sm" ? 14 : 18;
  const textClass =
    size === "sm"
      ? "text-sm font-sans-bold text-warning"
      : "text-base font-sans-bold text-warning";

  return (
    <Pressable onPress={() => router.push("/shop")}>
      <Animated.View
        style={animatedStyle}
        className="flex-row items-center gap-1.5 rounded-full px-3 py-1.5"
      >
        <Ionicons name="diamond" size={iconSize} color="#ffc107" />
        <Text className={textClass}>{displayedBalance}</Text>
      </Animated.View>
    </Pressable>
  );
}
