import { View, Text, Pressable, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "@/i18n";
import { COST_EXTRA_ATTEMPT, MAX_EXTRA_ATTEMPTS } from "@/constants";

interface BuyAttemptModalProps {
  visible: boolean;
  coinBalance: number;
  extraAttemptsBought: number;
  onBuy: () => void;
  onDecline: () => void;
}

export default function BuyAttemptModal({
  visible,
  coinBalance,
  extraAttemptsBought,
  onBuy,
  onDecline,
}: BuyAttemptModalProps) {
  const { t } = useTranslation();
  const remaining = MAX_EXTRA_ATTEMPTS - extraAttemptsBought;
  const canAfford = coinBalance >= COST_EXTRA_ATTEMPT;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/60 px-8">
        <View className="w-full rounded-3xl border border-border bg-card p-6">
          {/* Header */}
          <View className="items-center mb-5">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-destructive/20 mb-3">
              <Ionicons name="alert-circle" size={28} color="#ff5252" />
            </View>
            <Text className="text-xl font-heading-bold text-primary">
              {t.coins.outOfAttempts}
            </Text>
            <Text className="mt-1 text-sm font-sans-medium text-muted-foreground text-center">
              {t.coins.buyOrGiveUp}
            </Text>
          </View>

          {/* Balance */}
          <View className="flex-row items-center justify-center gap-1.5 mb-2">
            <Ionicons name="diamond" size={16} color="#ffc107" />
            <Text className="text-base font-sans-bold text-warning">{coinBalance}</Text>
          </View>

          {/* Remaining info */}
          <Text className="text-xs font-sans-medium text-muted-foreground text-center mb-5">
            {t.coins.attemptsRemaining(remaining)}
          </Text>

          {/* Buttons */}
          <View className="gap-3">
            <Pressable
              onPress={onBuy}
              disabled={!canAfford}
              className={`btn-3d ${!canAfford ? "btn-3d-disabled" : ""}`}
              style={({ pressed }) =>
                pressed && canAfford ? { borderBottomWidth: 2, marginTop: 3 } : {}
              }
            >
              <View className="flex-row items-center gap-2">
                <Ionicons name="diamond" size={16} color="#fff" />
                <Text className="btn-3d-text">
                  {t.coins.buyAttempt} ({COST_EXTRA_ATTEMPT})
                </Text>
              </View>
            </Pressable>

            {!canAfford && (
              <Text className="text-xs font-sans-medium text-destructive text-center">
                {t.coins.notEnough}
              </Text>
            )}

            <Pressable
              onPress={onDecline}
              className="btn-3d-destructive"
              style={({ pressed }) =>
                pressed ? { borderBottomWidth: 2, marginTop: 3 } : {}
              }
            >
              <Text className="btn-3d-destructive-text">{t.coins.giveUp}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
