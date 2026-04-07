import { useEffect, useState } from "react";
import { View, Text, Pressable, Modal } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTranslation } from "@/i18n";

interface CoinRewardModalProps {
  visible: boolean;
  coinsEarned: number;
  streakMilestone: number | null;
  freezeUsed: boolean;
  won: boolean;
  onDismiss: () => void;
}

export default function CoinRewardModal({
  visible,
  coinsEarned,
  streakMilestone,
  freezeUsed,
  won,
  onDismiss,
}: CoinRewardModalProps) {
  const { t } = useTranslation();
  const [displayedCoins, setDisplayedCoins] = useState(0);

  // Animations
  const iconScale = useSharedValue(0);
  const iconRotation = useSharedValue(0);
  const coinsOpacity = useSharedValue(0);
  const coinsScale = useSharedValue(0.5);
  const bonusOpacity = useSharedValue(0);
  const bonusTranslateY = useSharedValue(20);
  const freezeOpacity = useSharedValue(0);
  const hintOpacity = useSharedValue(0);

  useEffect(() => {
    if (!visible) {
      iconScale.value = 0;
      iconRotation.value = 0;
      coinsOpacity.value = 0;
      coinsScale.value = 0.5;
      bonusOpacity.value = 0;
      bonusTranslateY.value = 20;
      freezeOpacity.value = 0;
      hintOpacity.value = 0;
      setDisplayedCoins(0);
      return;
    }

    // Icon entrance
    iconScale.value = withSpring(1, { damping: 15, stiffness: 120 });
    iconRotation.value = withSequence(
      withTiming(-5, { duration: 120 }),
      withTiming(5, { duration: 120 }),
      withTiming(0, { duration: 120 }),
    );

    // Haptic on icon appear
    Haptics.notificationAsync(
      won ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning,
    );

    // Coins counter animation
    if (coinsEarned > 0) {
      coinsOpacity.value = withDelay(400, withTiming(1, { duration: 300 }));
      coinsScale.value = withDelay(400, withSpring(1, { damping: 16, stiffness: 150 }));

      // Animate coin count
      const steps = Math.min(coinsEarned, 20);
      const stepDuration = 600 / steps;
      for (let i = 1; i <= steps; i++) {
        setTimeout(() => {
          const value = Math.round((i / steps) * coinsEarned);
          setDisplayedCoins(value);
          if (i === steps) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          } else if (i % 3 === 0) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }, 400 + i * stepDuration);
      }
    }

    // Streak bonus
    if (streakMilestone && streakMilestone > 0) {
      bonusOpacity.value = withDelay(1100, withTiming(1, { duration: 300 }));
      bonusTranslateY.value = withDelay(1100, withSpring(0, { damping: 18 }));
    }

    // Freeze used
    if (freezeUsed) {
      freezeOpacity.value = withDelay(won ? 1100 : 500, withTiming(1, { duration: 300 }));
    }

    // Tap hint
    hintOpacity.value = withDelay(coinsEarned > 0 ? 1500 : 800, withTiming(1, { duration: 400 }));
  }, [visible]);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: iconScale.value },
      { rotate: `${iconRotation.value}deg` },
    ],
  }));

  const coinsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: coinsOpacity.value,
    transform: [{ scale: coinsScale.value }],
  }));

  const bonusAnimatedStyle = useAnimatedStyle(() => ({
    opacity: bonusOpacity.value,
    transform: [{ translateY: bonusTranslateY.value }],
  }));

  const freezeAnimatedStyle = useAnimatedStyle(() => ({
    opacity: freezeOpacity.value,
  }));

  const hintAnimatedStyle = useAnimatedStyle(() => ({
    opacity: hintOpacity.value,
  }));

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable
        className="flex-1 items-center justify-center bg-black/70 px-8"
        onPress={onDismiss}
      >
        <View className="w-full rounded-3xl border border-border bg-card p-8 items-center">
          {/* Icon */}
          <Animated.View
            style={[iconAnimatedStyle]}
            className="h-20 w-20 items-center justify-center rounded-full mb-5"
          >
            <View
              className="h-20 w-20 items-center justify-center rounded-full"
              style={{
                backgroundColor: won
                  ? "rgba(0,230,118,0.15)"
                  : freezeUsed
                    ? "rgba(0,188,212,0.15)"
                    : "rgba(255,82,82,0.15)",
              }}
            >
              <Ionicons
                name={won ? "trophy" : freezeUsed ? "snow" : "close-circle"}
                size={40}
                color={won ? "#00e676" : freezeUsed ? "#00bcd4" : "#ff5252"}
              />
            </View>
          </Animated.View>

          {/* Title */}
          <Text
            className="text-2xl font-heading-bold mb-2"
            style={{
              color: won ? "#00e676" : freezeUsed ? "#00bcd4" : "#ff5252",
            }}
          >
            {won ? t.coins.rewardTitle : t.coins.rewardLost}
          </Text>

          {/* Coins earned */}
          {coinsEarned > 0 && (
            <Animated.View
              style={coinsAnimatedStyle}
              className="flex-row items-center gap-3 mt-4"
            >
              <Ionicons name="diamond" size={28} color="#ffc107" />
              <Text className="text-4xl font-heading-bold text-warning">
                +{displayedCoins}
              </Text>
            </Animated.View>
          )}

          {/* No coins on loss */}
          {!won && coinsEarned === 0 && !freezeUsed && (
            <Text className="text-sm font-sans-medium text-muted-foreground mt-2">
              {t.coins.rewardLost}
            </Text>
          )}

          {/* Streak milestone bonus */}
          {streakMilestone !== null && streakMilestone > 0 && (
            <Animated.View
              style={bonusAnimatedStyle}
              className="mt-4 flex-row items-center gap-2 rounded-xl py-2.5 px-4"
              collapsable={false}
            >
              <View
                className="rounded-lg py-2 px-4 flex-row items-center gap-2"
                style={{ backgroundColor: "rgba(124,77,255,0.12)" }}
              >
                <Ionicons name="flame" size={18} color="#7c4dff" />
                <Text className="text-base font-sans-bold text-accent">
                  {t.coins.streakBonus} +{streakMilestone}
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Freeze used */}
          {freezeUsed && (
            <Animated.View
              style={freezeAnimatedStyle}
              className="mt-4"
              collapsable={false}
            >
              <View
                className="rounded-lg py-2.5 px-4 flex-row items-center gap-2"
                style={{ backgroundColor: "rgba(0,188,212,0.1)" }}
              >
                <Ionicons name="snow" size={16} color="#00bcd4" />
                <Text className="text-sm font-sans-bold" style={{ color: "#00bcd4" }}>
                  {t.coins.freezeProtected}
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Tap to continue */}
          <Animated.View style={hintAnimatedStyle} className="mt-6">
            <Text className="text-xs font-sans-medium text-muted-foreground/50">
              {t.coins.tapToContinue}
            </Text>
          </Animated.View>
        </View>
      </Pressable>
    </Modal>
  );
}
