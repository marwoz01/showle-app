import { useState } from "react";
import { View, Text, Pressable, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTranslation } from "@/i18n";
import { useWallet } from "@/hooks/useWallet";
import { COST_STREAK_FREEZE, MAX_STREAK_FREEZES } from "@/constants";

export default function ShopScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { balance, streakFreezes, spendCoins, refreshWallet } = useWallet();
  const [showModal, setShowModal] = useState(false);
  const [buying, setBuying] = useState(false);

  const canBuyFreeze = balance >= COST_STREAK_FREEZE && streakFreezes < MAX_STREAK_FREEZES;

  async function handleBuyFreeze() {
    if (!canBuyFreeze || buying) return;
    setBuying(true);
    const result = await spendCoins("buy_freeze");
    setBuying(false);
    if (result) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowModal(false);
      refreshWallet();
    }
  }

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top + 16 }}>
      <View className="px-5">
        {/* Header */}
        <View className="flex-row items-center gap-3 mb-8">
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color="#e8e8f0" />
          </Pressable>
          <Text className="text-2xl font-heading-bold text-primary">
            {t.coins.shopTitle}
          </Text>
        </View>

        {/* Balance card */}
        <View className="items-center rounded-2xl border border-border bg-card p-6 mb-8">
          <Text className="text-sm font-sans-medium text-muted-foreground mb-2">
            {t.coins.yourBalance}
          </Text>
          <View className="flex-row items-center gap-3">
            <Ionicons name="diamond" size={28} color="#ffc107" />
            <Text className="text-4xl font-heading-bold text-warning">
              {balance}
            </Text>
          </View>
        </View>

        {/* Streak Freeze card — tap to open modal */}
        <Pressable
          onPress={() => setShowModal(true)}
          className="rounded-2xl border border-border bg-card p-5"
        >
          <View className="flex-row items-start gap-4">
            <View
              className="h-12 w-12 items-center justify-center rounded-xl"
              style={{ backgroundColor: "rgba(0,188,212,0.12)" }}
            >
              <Ionicons name="snow" size={24} color="#00bcd4" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-sans-bold text-primary">
                {t.coins.buyFreeze}
              </Text>
              <Text className="text-sm font-sans-medium text-muted-foreground mt-0.5">
                {t.coins.buyFreezeDesc}
              </Text>
              <Text className="text-sm font-sans-bold mt-1" style={{ color: "#00bcd4" }}>
                {t.coins.freezesOwned(streakFreezes, MAX_STREAK_FREEZES)}
              </Text>
            </View>

            <View
              className="flex-row items-center gap-1.5 rounded-full px-4 py-2"
              style={{ backgroundColor: "#ffc107" }}
            >
              <Ionicons name="diamond" size={14} color="#fff" />
              <Text className="text-sm font-sans-bold" style={{ color: "#fff" }}>{COST_STREAK_FREEZE}</Text>
            </View>
          </View>
        </Pressable>
      </View>

      {/* Buy freeze modal */}
      <Modal visible={showModal} transparent animationType="fade">
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
          <View className="mx-8 w-full max-w-sm rounded-3xl border border-border bg-card p-8 items-center">
            {/* Icon */}
            <View
              className="h-24 w-24 items-center justify-center rounded-full mb-6"
              style={{ backgroundColor: "rgba(0,188,212,0.12)" }}
            >
              <Ionicons name="snow" size={52} color="#00bcd4" />
            </View>

            {/* Description */}
            <Text className="text-sm font-sans-medium text-muted-foreground text-center mb-2">
              {t.coins.buyFreezeDesc}
            </Text>

            <Text className="text-sm font-sans-bold mb-6" style={{ color: "#00bcd4" }}>
              {t.coins.freezesOwned(streakFreezes, MAX_STREAK_FREEZES)}
            </Text>

            {/* Buy button */}
            <Pressable
              onPress={handleBuyFreeze}
              disabled={!canBuyFreeze || buying}
              className={`w-full mb-3 ${!canBuyFreeze ? "opacity-40" : ""}`}
            >
              <View
                className="flex-row items-center justify-center gap-2 rounded-xl py-4"
                style={{ backgroundColor: "#ffc107" }}
              >
                <Ionicons name="diamond" size={18} color="#fff" />
                <Text className="text-base font-sans-bold" style={{ color: "#fff" }}>
                  {COST_STREAK_FREEZE}
                </Text>
              </View>
            </Pressable>

            {!canBuyFreeze && balance < COST_STREAK_FREEZE && streakFreezes < MAX_STREAK_FREEZES && (
              <Text className="text-xs font-sans-medium text-destructive mb-3">
                {t.coins.notEnough}
              </Text>
            )}

            {/* Cancel button */}
            <Pressable
              onPress={() => setShowModal(false)}
              className="w-full items-center rounded-xl py-3.5"
            >
              <Text className="text-sm font-sans-bold text-muted-foreground">
                {t.collections.cancel}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
