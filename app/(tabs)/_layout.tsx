import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#9e5f45",
        tabBarInactiveTintColor: "#5f6f52",
        tabBarStyle: {
          backgroundColor: "#fbf7ef",
          borderTopColor: "rgba(20, 17, 15, 0.12)",
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="collection" options={{ title: "Collection" }} />
      <Tabs.Screen name="crates" options={{ title: "Crates" }} />
      <Tabs.Screen name="journal" options={{ title: "Journal" }} />
    </Tabs>
  );
}
