import { View, Text } from "react-native";
import { Image } from "expo-image";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileHeader() {
  const { user } = useUser();

  return (
    <View className="items-center gap-3">
      {/* Avatar */}
      <View
        className="h-24 w-24 overflow-hidden rounded-full"
        style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
      >
        {user?.imageUrl ? (
          <Image
            source={{ uri: user.imageUrl }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Ionicons name="person" size={40} color="#8a8a9a" />
          </View>
        )}
      </View>

      {/* Name */}
      <Text className="text-xl font-heading-bold text-primary">
        {user?.fullName || user?.firstName || "Player"}
      </Text>

      {/* Email */}
      <Text className="-mt-1 text-sm font-sans-medium text-muted-foreground">
        {user?.primaryEmailAddress?.emailAddress}
      </Text>
    </View>
  );
}
