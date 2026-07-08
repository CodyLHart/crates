import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="copy/[id]" />
      <Stack.Screen name="crate/[id]" />
      <Stack.Screen name="artist/[id]" />
      <Stack.Screen name="track/[id]" />
      <Stack.Screen name="settings/index" />
    </Stack>
  );
}
