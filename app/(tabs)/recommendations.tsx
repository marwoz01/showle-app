import { Text, View } from "react-native";

export default function Recommendations() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-2xl font-heading-bold text-primary">For You</Text>
      <Text className="mt-2 text-base font-sans-medium text-muted-foreground">
        Recommendations
      </Text>
    </View>
  );
}
