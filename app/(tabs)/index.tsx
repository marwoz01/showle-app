import { ScrollView, View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "@/i18n";
import GameModeCard from "@/components/home/GameModeCard";

export default function Home() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingTop: insets.top + 20, paddingHorizontal: 20, paddingBottom: 100 }}
    >
      {/* Header */}
      <View className="mb-8">
        <Text className="mb-2 text-4xl font-heading-bold text-primary">
          {t.home.title}
        </Text>
        <Text className="text-base font-sans-medium text-muted-foreground">
          {t.home.subtitle}
        </Text>
      </View>

      {/* Game mode cards */}
      <View className="gap-5">
        <GameModeCard
          icon={<Ionicons name="film-outline" size={22} color="#7c4dff" />}
          title={t.modes.dailyMovie}
          description={t.modes.dailyMovieDesc}
          href="/daily"
          actionLabel={t.modes.playChallenge}
          badge={t.modes.popular}
        />
        <GameModeCard
          icon={<Ionicons name="sparkles-outline" size={22} color="#7c4dff" />}
          title={t.recommend.modeTitle}
          description={t.recommend.modeDesc}
          href="/recommendations"
          actionLabel={t.recommend.getRecommendations}
          badge={t.modes.new}
        />
      </View>
    </ScrollView>
    </View>
  );
}
