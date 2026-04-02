import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useEffect, useRef } from "react";

const TAB_ICONS: Record<string, [string, string]> = {
  index: ["home-outline", "home"],
  daily: ["film-outline", "film"],
  recommendations: ["sparkles-outline", "sparkles"],
  collections: ["albums-outline", "albums"],
  profile: ["person-outline", "person"],
};

export default function TabBar({ state, navigation }: BottomTabBarProps) {
  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const tabLayouts = useRef<Record<number, { x: number; width: number }>>({});

  const updateIndicator = (index: number, animate: boolean) => {
    const layout = tabLayouts.current[index];
    if (!layout) return;

    const barWidth = layout.width * 0.5;
    const targetX = layout.x + (layout.width - barWidth) / 2;

    if (animate) {
      indicatorX.value = withSpring(targetX, {
        damping: 12,
        stiffness: 200,
        mass: 0.6,
        overshootClamping: false,
      });
      indicatorWidth.value = withSpring(barWidth, {
        damping: 15,
        stiffness: 200,
      });
    } else {
      indicatorX.value = targetX;
      indicatorWidth.value = barWidth;
    }
  };

  useEffect(() => {
    updateIndicator(state.index, true);
  }, [state.index]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: indicatorWidth.value,
  }));

  return (
    <View className="absolute bottom-6 left-4 right-4">
      {/* Top border glow */}
      <View className="absolute -top-px left-0 right-0 z-10 overflow-hidden rounded-full">
        <LinearGradient
          colors={["transparent", "rgba(124,77,255,0.5)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ height: 1 }}
        />
      </View>

      <View
        className="overflow-hidden rounded-full border border-white/5"
        style={{ backgroundColor: "#151517" }}
      >
        <View className="flex-row items-center justify-around px-2 py-3">
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const [outline] = TAB_ICONS[route.name] ?? [
              "help-outline",
              "help",
            ];

            return (
              <Pressable
                key={route.key}
                className="flex-1 items-center justify-center"
                onLayout={(e) => {
                  tabLayouts.current[index] = {
                    x: e.nativeEvent.layout.x,
                    width: e.nativeEvent.layout.width,
                  };
                  if (focused) {
                    updateIndicator(index, false);
                  }
                }}
                onPress={() => {
                  if (!focused) {
                    navigation.navigate(route.name);
                  }
                }}
              >
                <View
                  className="items-center justify-center rounded-full p-3"
                  style={
                    focused
                      ? { backgroundColor: "rgba(124,77,255,0.12)" }
                      : undefined
                  }
                >
                  <Ionicons
                    name={outline as any}
                    size={22}
                    color={focused ? "#7c4dff" : "#8a8a9a"}
                  />
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Animated bottom indicator */}
        <Animated.View
          style={[
            {
              position: "absolute",
              bottom: 0,
              left: 0,
              height: 2,
              borderRadius: 1,
              backgroundColor: "#7c4dff",
            },
            indicatorStyle,
          ]}
        />
      </View>
    </View>
  );
}
