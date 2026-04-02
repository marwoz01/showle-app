import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "@/i18n";

export default function ProfileHeader() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const { t } = useTranslation();

  return (
    <View className="items-center gap-4">
      {/* Avatar */}
      <View
        className="h-20 w-20 overflow-hidden rounded-full"
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
            <Ionicons name="person" size={36} color="#8a8a9a" />
          </View>
        )}
      </View>

      {/* Name & email */}
      <View className="items-center">
        <Text className="text-xl font-heading-bold text-primary">
          {user?.fullName || user?.firstName || "Player"}
        </Text>
        <Text className="mt-0.5 text-sm font-sans-medium text-muted-foreground">
          {user?.primaryEmailAddress?.emailAddress}
        </Text>
      </View>

      {/* Sign out */}
      <Pressable
        onPress={() => signOut()}
        className="flex-row items-center gap-2 rounded-xl border border-border px-5 py-2.5"
      >
        <Ionicons name="log-out-outline" size={16} color="#8a8a9a" />
        <Text className="text-sm font-sans-medium text-muted-foreground">
          {t.profile.signOut}
        </Text>
      </Pressable>
    </View>
  );
}
