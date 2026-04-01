import "@/global.css";
import { Text, View, Pressable } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";

export default function App() {
  const router = useRouter();
  const [signInPressed, setSignInPressed] = useState(false);
  const [signUpPressed, setSignUpPressed] = useState(false);

  return (
    <View className="flex-1 items-center justify-center gap-6 bg-background px-6">
      <Text className="text-4xl font-heading-bold text-primary">Showle</Text>
      <Text className="text-base font-sans-medium text-muted-foreground">
        Dark theme with mint accents
      </Text>

      <View className="mt-4 w-full gap-4">
        <Pressable
          className={`btn-3d ${signInPressed ? "btn-3d-pressed" : ""}`}
          onPressIn={() => setSignInPressed(true)}
          onPressOut={() => setSignInPressed(false)}
          onPress={() => router.push("/(auth)/sign-in")}
        >
          <Text className="btn-3d-text">Sign In</Text>
        </Pressable>

        <Pressable
          className={`btn-3d-secondary ${signUpPressed ? "btn-3d-pressed" : ""}`}
          onPressIn={() => setSignUpPressed(true)}
          onPressOut={() => setSignUpPressed(false)}
          onPress={() => router.push("/(auth)/sign-up")}
        >
          <Text className="btn-3d-secondary-text">Create Account</Text>
        </Pressable>
      </View>
    </View>
  );
}
