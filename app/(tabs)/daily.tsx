import { Text, View } from "react-native";

export default function Daily() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-2xl font-heading-bold text-primary">
        Daily Movie
      </Text>
      <Text className="mt-2 text-base font-sans-medium text-muted-foreground">
        Guess today's movie
      </Text>
    </View>
  );
}
