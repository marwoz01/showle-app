import { useEffect } from "react";
import { View, Text, Pressable, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "@/i18n";

interface StreakModalProps {
  visible: boolean;
  type: "freeze_used" | "streak_broken";
  remainingFreezes?: number;
  previousStreak?: number;
  onDismiss: () => void;
}

export default function StreakModal({
  visible,
  type,
  remainingFreezes,
  previousStreak,
  onDismiss,
}: StreakModalProps) {
  const { t } = useTranslation();

  // Auto-dismiss after 4 seconds
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [visible, onDismiss]);

  const isFrozen = type === "freeze_used";

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable className="flex-1 items-center justify-center bg-black/60 px-8" onPress={onDismiss}>
        <View className="w-full rounded-3xl border border-border bg-card p-6 items-center">
          {/* Icon */}
          <View
            className="h-16 w-16 items-center justify-center rounded-full mb-4"
            style={{ backgroundColor: isFrozen ? "rgba(0,188,212,0.15)" : "rgba(255,82,82,0.15)" }}
          >
            <Ionicons
              name={isFrozen ? "snow" : "flame"}
              size={32}
              color={isFrozen ? "#00bcd4" : "#ff5252"}
            />
          </View>

          {/* Title */}
          <Text
            className="text-xl font-heading-bold mb-2"
            style={{ color: isFrozen ? "#00bcd4" : "#ff5252" }}
          >
            {isFrozen ? t.coins.freezeUsed : t.coins.streakBroken}
          </Text>

          {/* Subtitle */}
          {isFrozen && remainingFreezes !== undefined && (
            <Text className="text-sm font-sans-medium text-muted-foreground text-center">
              {t.coins.freezesOwned(remainingFreezes, 2)}
            </Text>
          )}
          {!isFrozen && previousStreak !== undefined && previousStreak > 0 && (
            <Text className="text-sm font-sans-medium text-muted-foreground text-center">
              {t.coins.streakWas(previousStreak)}
            </Text>
          )}

          {/* Tap to dismiss hint */}
          <Text className="mt-4 text-xs font-sans-medium text-muted-foreground/50">
            Tap to dismiss
          </Text>
        </View>
      </Pressable>
    </Modal>
  );
}
