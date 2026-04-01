import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

interface GameModeCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  actionLabel: string;
  badge?: string;
  disabled?: boolean;
}

export default function GameModeCard({
  icon,
  title,
  description,
  href,
  actionLabel,
  badge,
  disabled = false,
}: GameModeCardProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={() => router.navigate(href as any)}
      className="rounded-2xl border border-border bg-card p-6"
      style={({ pressed }) => [
        pressed && !disabled && { backgroundColor: "#1a1a1d" },
        disabled && { opacity: 0.7 },
      ]}
    >
      {/* Top row: icon + badge */}
      <View className="mb-5 flex-row items-start justify-between">
        <View className="h-11 w-11 items-center justify-center rounded-xl bg-accent/15">
          {icon}
        </View>
        {badge && (
          <View className="rounded-md bg-accent/15 px-2.5 py-1">
            <Text className="text-[11px] font-sans-semibold uppercase tracking-wider text-accent">
              {badge}
            </Text>
          </View>
        )}
      </View>

      {/* Title */}
      <Text className="mb-2 text-xl font-heading-semibold text-primary">
        {title}
      </Text>

      {/* Description */}
      <Text className="text-sm font-sans-medium leading-relaxed text-muted-foreground">
        {description}
      </Text>

      {/* Action label with arrow */}
      <View className="mt-6 flex-row items-center gap-1">
        <Text
          className={`text-sm font-sans-semibold ${disabled ? "text-muted-foreground" : "text-accent"}`}
        >
          {actionLabel}
        </Text>
        {!disabled && (
          <Ionicons name="chevron-forward" size={16} color="#7c4dff" />
        )}
      </View>
    </Pressable>
  );
}
