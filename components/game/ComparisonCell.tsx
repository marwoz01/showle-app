import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MatchStatus, Direction } from "@/types";

interface ComparisonCellProps {
  label: string;
  value: string;
  status: MatchStatus;
  direction?: Direction;
}

const statusStyles: Record<MatchStatus, { bg: string; border: string; text: string }> = {
  exact: { bg: "#00e67626", border: "#00e6764d", text: "#00e676" },
  partial: { bg: "#ffc10726", border: "#ffc1074d", text: "#ffc107" },
  miss: { bg: "#ff525226", border: "#ff52524d", text: "#ff5252" },
};

export default function ComparisonCell({ label, value, status, direction }: ComparisonCellProps) {
  const colors = statusStyles[status];

  return (
    <View
      style={{
        backgroundColor: colors.bg,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 8,
        alignItems: "center",
        gap: 2,
        flexBasis: "31%",
        flexGrow: 1,
      }}
    >
      <Text
        style={{ color: colors.text, fontSize: 9, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, opacity: 0.7 }}
        numberOfLines={1}
      >
        {label}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
        <Text
          style={{ color: colors.text, fontSize: 11, fontWeight: "700" }}
          numberOfLines={1}
        >
          {value}
        </Text>
        {direction && (
          <Ionicons
            name={direction === "up" ? "chevron-up" : "chevron-down"}
            size={12}
            color={colors.text}
          />
        )}
      </View>
    </View>
  );
}
