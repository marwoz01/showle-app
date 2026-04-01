import { Tabs } from "expo-router";
import TabBar from "@/components/tab-bar";

export default function TabsLayout() {
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
