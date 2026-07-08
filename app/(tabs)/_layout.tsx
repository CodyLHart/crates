import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { colors, typography } from "@/design/tokens";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ember,
        tabBarInactiveTintColor: colors.inkMuted,
        tabBarLabelStyle: {
          ...typography.caption,
          fontSize: 11,
        },
        tabBarStyle: {
          backgroundColor: colors.nightSoft,
          borderTopColor: colors.border,
          height: 82,
          paddingBottom: 18,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="home-outline" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="collection"
        options={{
          title: "Collection",
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="albums-outline" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="crates"
        options={{
          title: "Crates",
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="cube-outline" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: "Journal",
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="book-outline" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="settings-outline" size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
