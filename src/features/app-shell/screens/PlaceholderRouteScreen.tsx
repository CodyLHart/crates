import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

import type { PlaceholderRoute } from "@/constants/placeholders";
import { colors, spacing, typography } from "@/design/tokens";

type PlaceholderRouteScreenProps = {
  route: PlaceholderRoute;
};

export function PlaceholderRouteScreen({ route }: PlaceholderRouteScreenProps) {
  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <Text style={styles.eyebrow}>{route.eyebrow}</Text>
        <Text style={styles.title}>{route.title}</Text>
        <Text style={styles.description}>{route.description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.xxl,
  },
  content: {
    marginTop: spacing.xxxl,
    maxWidth: 576,
  },
  eyebrow: {
    ...typography.eyebrow,
    color: colors.moss,
    textTransform: "uppercase",
  },
  title: {
    ...typography.title,
    color: colors.ink,
    marginTop: spacing.md,
  },
  description: {
    ...typography.body,
    color: colors.inkMuted,
    marginTop: spacing.lg,
  },
});
