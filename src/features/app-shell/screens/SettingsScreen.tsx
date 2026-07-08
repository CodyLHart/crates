import { StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/Screen";
import { colors, radii, spacing, typography } from "@/design/tokens";

const settings = [
  {
    title: "Local demo mode",
    detail: "Supabase, SQLite, Discogs, auth, sync, and persistence are intentionally deferred.",
  },
  {
    title: "Physical collection",
    detail:
      "The shell uses Copy, Release, Crate, Tag, and Journal vocabulary from the product docs.",
  },
  {
    title: "Expo Go target",
    detail: "Pinned to Expo SDK 54 for current App Store Expo Go compatibility.",
  },
];

export function SettingsScreen() {
  return (
    <Screen>
      <Text style={styles.eyebrow}>Settings</Text>
      <Text style={styles.title}>Quiet app context for now.</Text>
      <Text style={styles.body}>
        This area stays informational until account and provider milestones begin.
      </Text>

      <View style={styles.stack}>
        {settings.map((item) => (
          <View key={item.title} style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.body}>{item.detail}</Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    ...typography.eyebrow,
    color: colors.ember,
    textTransform: "uppercase",
  },
  title: {
    ...typography.title,
    color: colors.cream,
    marginTop: spacing.sm,
  },
  body: {
    ...typography.body,
    color: colors.creamMuted,
  },
  stack: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  card: {
    backgroundColor: colors.nightSoft,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  cardTitle: {
    ...typography.subheading,
    color: colors.cream,
  },
});
