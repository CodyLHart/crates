import { StyleSheet, Text, View } from "react-native";

import { ArtworkTile } from "@/components/ArtworkTile";
import { CopyRow } from "@/components/CopyRow";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { TagPill } from "@/components/TagPill";
import { demoCopies, recentJournalEntries } from "@/constants/demoData";
import { colors, radii, spacing, typography } from "@/design/tokens";

const featuredCopy = demoCopies[1];

export function HomeScreen() {
  return (
    <Screen>
      <View style={styles.hero}>
        <View style={styles.heroCopy}>
          <Text style={styles.eyebrow}>Rediscover</Text>
          <Text style={styles.title}>Spend a minute with a Copy you already love.</Text>
          <Text style={styles.body}>
            {featuredCopy.release.title} has a fresh Journal memory and belongs in{" "}
            {featuredCopy.crates[0].name}.
          </Text>
          <View style={styles.tagRow}>
            {featuredCopy.tags.map((tag) => (
              <TagPill key={tag.id} label={tag.name} tone="warm" />
            ))}
          </View>
        </View>
        <ArtworkTile artwork={featuredCopy.release.artwork} size="lg" />
      </View>

      <SectionHeader eyebrow="Recently Played" title="Back on the turntable" />
      <View style={styles.stack}>
        {demoCopies.slice(0, 3).map((copy) => (
          <CopyRow key={copy.id} copy={copy} />
        ))}
      </View>

      <SectionHeader eyebrow="Journal" title="Collection moments" />
      <View style={styles.journalCard}>
        <Text style={styles.journalType}>{recentJournalEntries[0].type}</Text>
        <Text style={styles.journalTitle}>{recentJournalEntries[0].title}</Text>
        <Text style={styles.body}>{recentJournalEntries[0].body}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.nightRaised,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  heroCopy: {
    gap: spacing.md,
  },
  eyebrow: {
    ...typography.eyebrow,
    color: colors.ember,
    textTransform: "uppercase",
  },
  title: {
    ...typography.title,
    color: colors.cream,
  },
  body: {
    ...typography.body,
    color: colors.creamMuted,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  stack: {
    gap: spacing.md,
  },
  journalCard: {
    backgroundColor: colors.nightSoft,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  journalType: {
    ...typography.caption,
    color: colors.ember,
    textTransform: "uppercase",
  },
  journalTitle: {
    ...typography.subheading,
    color: colors.cream,
  },
});
