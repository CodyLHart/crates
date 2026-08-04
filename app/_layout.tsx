import { Stack } from "expo-router";
import { KeyboardProvider } from "react-native-keyboard-controller";

export default function RootLayout() {
  return (
    <KeyboardProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="copy/new" />
        <Stack.Screen name="copy/[id]/edit" />
        <Stack.Screen name="copy/[id]" />
        <Stack.Screen name="crate/new" />
        <Stack.Screen name="crate/[id]/edit" />
        <Stack.Screen name="crate/[id]" />
        <Stack.Screen name="journal/new" />
        <Stack.Screen name="journal/[id]/edit" />
        <Stack.Screen name="artist/[id]" />
        <Stack.Screen name="track/[id]" />
        <Stack.Screen name="settings/tags" />
        <Stack.Screen name="settings/index" />
      </Stack>
    </KeyboardProvider>
  );
}
