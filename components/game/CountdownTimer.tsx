import { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getTimeUntilReset } from "@/lib/daily";
import { useTranslation } from "@/i18n";

export default function CountdownTimer() {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(getTimeUntilReset());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeUntilReset());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalSeconds = Math.max(0, Math.floor(timeLeft / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <View className="flex-row items-center gap-2">
      <Ionicons name="time-outline" size={16} color="#8a8a9a" />
      <Text className="text-sm font-sans-medium text-muted-foreground">{t.game.nextIn}</Text>
      <Text className="text-sm font-sans-bold text-primary">
        {pad(hours)}:{pad(minutes)}:{pad(seconds)}
      </Text>
    </View>
  );
}
