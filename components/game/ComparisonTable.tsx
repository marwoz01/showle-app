import { View } from "react-native";
import { ComparisonField } from "@/types";
import ComparisonCell from "./ComparisonCell";

interface ComparisonTableProps {
  comparison: ComparisonField[];
}

export default function ComparisonTable({ comparison }: ComparisonTableProps) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {comparison.map((field) => (
        <ComparisonCell
          key={field.label}
          label={field.label}
          value={field.guessValue}
          status={field.status}
          direction={field.direction}
        />
      ))}
    </View>
  );
}
