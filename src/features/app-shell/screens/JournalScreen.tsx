import { StyleSheet, Text, View } from "react-native";

import { ArtworkTile } from "@/components/ArtworkTile";
import { Screen } from "@/components/Screen";
import { recentJournalEntries } from "@/constants/demoData";
import { colors, radii, spacing, typography } from "@/design/tokens";

export function JournalScreen() {
  return (
    <Screen>
      <Text style={styles.eyebrow}>Journal</Text>
      <Text style={styles.title}>The story of ownership, one Copy at a time.</Text>
      <Text style={styles.body}>
        Notes, memories, purchases, and listening events will eventually live here.
      </Text>

      <View style={styles.timeline}>
        {recentJournalEntries.map((entry) => (
          <View key={entry.id} style={styles.entry}>
            <ArtworkTile artwork={entry.copy.release.artwork} size="sm" />
            <View style={styles.entryBody}>
              <Text style={styles.entryType}>{entry.type}</Text>
              <Text style={styles.entryTitle}>{entry.title}</Text>
              <Text style={styles.copyName}>
                {entry.copy.release.primaryArtistName} · {entry.copy.release.title}
              </Text>
              <Text style={styles.body}>{entry.body}</Text>
            </View>
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
  timeline: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  entry: {
    backgroundColor: colors.nightSoft,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
  },
  entryBody: {
    flex: 1,
    gap: spacing.xs,
  },
  entryType: {
    ...typography.caption,
    color: colors.ember,
    textTransform: "uppercase",
  },
  entryTitle: {
    ...typography.subheading,
    color: colors.cream,
  },
  copyName: {
    ...typography.caption,
    color: colors.inkMuted,
  },
});
