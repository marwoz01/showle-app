import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Hint } from "@/types";
import { MAX_ATTEMPTS } from "@/constants";
import { useTranslation } from "@/i18n";

interface HintsPanelProps {
  revealedHints: Hint[];
  totalHints: number;
}

export default function HintsPanel({ revealedHints, totalHints }: HintsPanelProps) {
  const { t } = useTranslation();
  const lockedCount = Math.max(0, totalHints - revealedHints.length);

  return (
    <View className="rounded-2xl border border-border bg-card p-5">
      <Text className="mb-4 text-sm font-sans-semibold uppercase tracking-wider text-muted-foreground">
        {t.hints.title}
      </Text>

      <View className="gap-2.5">
        {revealedHints.map((hint) => (
          <View
            key={hint.id}
            className="flex-row items-start gap-3 rounded-lg px-3 py-2.5"
            style={{ backgroundColor: "rgba(124,77,255,0.05)" }}
          >
            <Ionicons name="bulb-outline" size={16} color="#7c4dff" style={{ marginTop: 2 }} />
            <Text className="flex-1 text-sm font-sans-medium text-primary">
              {hint.content}
            </Text>
          </View>
        ))}

        {Array.from(
          { length: Math.min(lockedCount, MAX_ATTEMPTS - revealedHints.length) },
          (_, i) => (
            <View
              key={`locked-${i}`}
              className="flex-row items-center gap-3 rounded-lg px-3 py-2.5"
              style={{ backgroundColor: "rgba(255,255,255,0.02)" }}
            >
              <Ionicons name="lock-closed-outline" size={16} color="rgba(138,138,154,0.4)" />
              <Text style={{ color: "rgba(138,138,154,0.4)", fontSize: 14 }}>???</Text>
            </View>
          )
        )}
      </View>
    </View>
  );
}
