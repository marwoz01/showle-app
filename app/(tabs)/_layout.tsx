import { Tabs } from "expo-router";
import TabBar from "@/components/tab-bar";
import { useSyncOnForeground } from "@/hooks/useSyncOnForeground";

export default function TabsLayout() {
  useSyncOnForeground();
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="daily" />
      <Tabs.Screen name="recommendations" />
      <Tabs.Screen name="collections" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
