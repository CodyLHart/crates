import { Link, useFocusEffect } from "expo-router";
import { Fragment, useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppHeader } from "@/components/AppHeader";
import { ArtworkTile } from "@/components/ArtworkTile";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import { listJournalEntries } from "@/db/repositories";
import { colors, radii, spacing, typography } from "@/design/tokens";
import { useAsyncData } from "@/hooks/useAsyncData";
import type { JournalEntryWithCopy } from "@/types/domain";
import { getCopyArtist, getCopyArtwork, getCopyTitle } from "@/utils/copyDisplay";
import {
  formatJournalDateHeading,
  formatJournalTimestamp,
  getJournalEntryTitle,
  getJournalEntryTypeLabel,
} from "@/utils/journalDisplay";

export function JournalScreen() {
  const [refreshKey, setRefreshKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setRefreshKey((current) => current + 1);
    }, []),
  );

  const {
    data: journalEntries = [],
    error,
    isLoading,
  } = useAsyncData(listJournalEntries, [refreshKey]);
  const sections = groupEntriesByDate(journalEntries);

  return (
    <Screen>
      <AppHeader title="Journal" subtitle="The story of ownership, one Copy at a time" />
      <Link href="/journal/new" style={styles.addLink}>
        Add Entry
      </Link>

      <View style={styles.timeline}>
        {isLoading ? (
          <EmptyState title="Loading Journal" body="Reading local Journal Entries from SQLite." />
        ) : error ? (
          <EmptyState title="Journal unavailable" body={error.message} />
        ) : journalEntries.length ? (
          sections.map((section) => (
            <Fragment key={section.title}>
              <Text style={styles.dateHeading}>{section.title}</Text>
              {section.entries.map((entry) => (
                <Link
                  asChild
                  href={{
                    pathname: "/journal/[id]/edit",
                    params: { id: entry.id },
                  }}
                  key={entry.id}
                >
                  <Pressable accessibilityRole="button" style={styles.entry}>
                    <ArtworkTile artwork={getCopyArtwork(entry.copy)} size="sm" />
                    <View style={styles.entryBody}>
                      <View style={styles.entryMetaRow}>
                        <Text style={styles.entryType}>{getJournalEntryTypeLabel(entry.type)}</Text>
                        <Text style={styles.entryDate}>
                          {formatJournalTimestamp(entry.occurredAt)}
                        </Text>
                      </View>
                      <Text style={styles.entryTitle}>{getJournalEntryTitle(entry)}</Text>
                      <Text style={styles.copyName}>
                        {getCopyArtist(entry.copy)} · {getCopyTitle(entry.copy)}
                      </Text>
                      <Text style={styles.body}>{entry.body}</Text>
                    </View>
                  </Pressable>
                </Link>
              ))}
            </Fragment>
          ))
        ) : (
          <EmptyState
            title="No Journal entries yet"
            body="Add the first note, purchase story, memory, or listening moment from here."
          />
        )}
      </View>
    </Screen>
  );
}

function groupEntriesByDate(entries: JournalEntryWithCopy[]) {
  const sections = new Map<string, JournalEntryWithCopy[]>();

  entries.forEach((entry) => {
    const title = formatJournalDateHeading(entry.occurredAt);
    const sectionEntries = sections.get(title) ?? [];

    sectionEntries.push(entry);
    sections.set(title, sectionEntries);
  });

  return [...sections.entries()].map(([title, sectionEntries]) => ({
    title,
    entries: sectionEntries,
  }));
}

const styles = StyleSheet.create({
  body: {
    ...typography.body,
    color: colors.creamMuted,
  },
  addLink: {
    ...typography.subheading,
    alignSelf: "flex-start",
    backgroundColor: colors.ember,
    borderRadius: radii.md,
    color: colors.night,
    overflow: "hidden",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  timeline: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  dateHeading: {
    ...typography.caption,
    color: colors.ember,
    marginTop: spacing.sm,
    textTransform: "uppercase",
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
  entryMetaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  entryType: {
    ...typography.caption,
    color: colors.ember,
    textTransform: "uppercase",
  },
  entryDate: {
    ...typography.caption,
    color: colors.inkMuted,
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
