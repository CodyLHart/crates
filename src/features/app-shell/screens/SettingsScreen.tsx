import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/Screen";
import { colors, radii, spacing, typography } from "@/design/tokens";

const settings = [
  {
    title: "Local demo mode",
    detail: "Supabase, Discogs, auth, sync, and cloud persistence are intentionally deferred.",
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
        <Link href="/settings/tags" asChild>
          <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
            <Text style={styles.cardTitle}>Tags</Text>
            <Text style={styles.body}>Create, edit, and color-code local Tags.</Text>
          </Pressable>
        </Link>
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
  cardPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.992 }],
  },
  cardTitle: {
    ...typography.subheading,
    color: colors.cream,
  },
});
