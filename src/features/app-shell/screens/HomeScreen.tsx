import { StyleSheet, Text, View } from "react-native";

import { ArtworkTile } from "@/components/ArtworkTile";
import { CopyRow } from "@/components/CopyRow";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { TagPill } from "@/components/TagPill";
import { listCopies, listRecentJournalEntries } from "@/db/repositories";
import { colors, radii, spacing, typography } from "@/design/tokens";
import { useAsyncData } from "@/hooks/useAsyncData";

export function HomeScreen() {
  const { data, error, isLoading } = useAsyncData(async () => {
    const [copies, recentJournalEntries] = await Promise.all([
      listCopies(),
      listRecentJournalEntries(),
    ]);

    return {
      copies,
      recentJournalEntries,
    };
  }, []);

  const copies = data?.copies ?? [];
  const featuredCopy = copies[1] ?? copies[0];
  const recentJournalEntry = data?.recentJournalEntries[0];

  return (
    <Screen>
      {isLoading ? (
        <EmptyState
          title="Loading local collection"
          body="Opening the SQLite shelf on this device."
        />
      ) : error ? (
        <EmptyState title="Home unavailable" body={error.message} />
      ) : featuredCopy ? (
        <View style={styles.hero}>
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>Rediscover</Text>
            <Text style={styles.title}>Spend a minute with a Copy you already love.</Text>
            <Text style={styles.body}>
              {featuredCopy.release.title} has a fresh Journal memory and belongs in{" "}
              {featuredCopy.crates[0]?.name ?? "your Collection"}.
            </Text>
            <View style={styles.tagRow}>
              {featuredCopy.tags.map((tag) => (
                <TagPill key={tag.id} label={tag.name} tone="warm" />
              ))}
            </View>
          </View>
          <ArtworkTile artwork={featuredCopy.release.artwork} size="lg" />
        </View>
      ) : (
        <EmptyState
          title="No Copies yet"
          body="Your local collection will appear here once it has Copies."
        />
      )}

      <SectionHeader eyebrow="Recently Played" title="Back on the turntable" />
      <View style={styles.stack}>
        {copies.slice(0, 3).map((copy) => (
          <CopyRow key={copy.id} copy={copy} />
        ))}
      </View>

      <SectionHeader eyebrow="Journal" title="Collection moments" />
      {recentJournalEntry ? (
        <View style={styles.journalCard}>
          <Text style={styles.journalType}>{recentJournalEntry.type}</Text>
          <Text style={styles.journalTitle}>{recentJournalEntry.title}</Text>
          <Text style={styles.body}>{recentJournalEntry.body}</Text>
        </View>
      ) : (
        <EmptyState
          title="No Journal entries yet"
          body="Journal moments from local Copies will appear here."
        />
      )}
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
