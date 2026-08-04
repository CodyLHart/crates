import { Link, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AnimatedAppear } from "@/components/AnimatedAppear";
import { AppHeader } from "@/components/AppHeader";
import { ArtworkTile } from "@/components/ArtworkTile";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import { TagPill } from "@/components/TagPill";
import { getCopyWithRelease } from "@/db/repositories";
import { colors, radii, spacing, typography } from "@/design/tokens";
import { useAsyncData } from "@/hooks/useAsyncData";
import {
  getCopyArtist,
  getCopyArtwork,
  getCopyFormat,
  getCopyGenre,
  getCopyLabel,
  getCopyTitle,
  getCopyYear,
} from "@/utils/copyDisplay";
import {
  formatJournalTimestamp,
  getJournalEntryTitle,
  getJournalEntryTypeLabel,
} from "@/utils/journalDisplay";

type CopyDetailScreenProps = {
  copyId: string;
};

export function CopyDetailScreen({ copyId }: CopyDetailScreenProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setRefreshKey((current) => current + 1);
    }, []),
  );

  const {
    data: copy,
    error,
    isLoading,
  } = useAsyncData(() => getCopyWithRelease(copyId), [copyId, refreshKey]);

  if (isLoading) {
    return (
      <Screen>
        <AppHeader title="Copy" subtitle="Loading from local SQLite" showBack />
        <EmptyState
          title="Loading Copy"
          body="Opening this Copy from the local collection database."
        />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <AppHeader title="Copy" subtitle="Local database error" showBack />
        <EmptyState title="Copy unavailable" body={error.message} />
      </Screen>
    );
  }

  if (!copy) {
    return (
      <Screen>
        <AppHeader title="Copy" subtitle="This detail route needs a valid local Copy" showBack />
        <EmptyState
          title="Copy not found"
          body="Return to Collection and choose one of the local demo Copies from the shelf."
        />
      </Screen>
    );
  }

  const copyYear = getCopyYear(copy);
  const releaseYear = copyYear ? `${copyYear} · ` : "";
  const artist = getCopyArtist(copy);
  const artwork = getCopyArtwork(copy);

  return (
    <Screen>
      <AppHeader title="Copy" subtitle={artist} showBack />
      <AnimatedAppear>
        <View style={styles.hero}>
          <View
            style={[
              styles.heroGlow,
              {
                backgroundColor: artwork.backgroundColor,
              },
            ]}
          />
          <ArtworkTile artwork={artwork} size="xl" />
        </View>
      </AnimatedAppear>

      <AnimatedAppear delay={80}>
        <View style={styles.heroCopy}>
          <Text style={styles.eyebrow}>Now Viewing</Text>
          <Text style={styles.title}>{getCopyTitle(copy)}</Text>
          <Text style={styles.artist}>{artist}</Text>
          <Text style={styles.body}>
            {releaseYear}
            {getCopyLabel(copy)} · {getCopyFormat(copy)} · {getCopyGenre(copy)}
          </Text>
          <Link
            href={{
              pathname: "/copy/[id]/edit",
              params: { id: copy.id },
            }}
            style={styles.editLink}
          >
            Edit Copy
          </Link>
        </View>
      </AnimatedAppear>

      <AnimatedAppear delay={140}>
        <View style={styles.snapshot}>
          <Detail label="Condition" value={copy.condition} />
          <Detail label="Rating" value={`${copy.rating}/5`} />
          <Detail label="Last Played" value={copy.lastPlayedAt} />
        </View>
      </AnimatedAppear>

      <AnimatedAppear delay={200}>
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Why this Copy matters</Text>
          <Text style={styles.body}>{copy.personalNote}</Text>
          <Text style={styles.acquired}>Acquired from {copy.acquiredFrom}</Text>
        </View>
      </AnimatedAppear>

      <AnimatedAppear delay={260}>
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Crates & Tags</Text>
          <View style={styles.tagRow}>
            {copy.crates.map((crate) => (
              <TagPill key={crate.id} label={crate.name} tone="warm" />
            ))}
            {copy.tags.map((tag) => (
              <TagPill key={tag.id} color={tag.color} label={tag.name} />
            ))}
          </View>
        </View>
      </AnimatedAppear>

      <AnimatedAppear delay={320}>
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Journal</Text>
            <Link
              href={{
                pathname: "/journal/new",
                params: { copyId: copy.id },
              }}
              style={styles.inlineLink}
            >
              Add Entry
            </Link>
          </View>
          {copy.journalEntries.length ? (
            copy.journalEntries.map((entry) => (
              <Link
                asChild
                href={{
                  pathname: "/journal/[id]/edit",
                  params: { id: entry.id, returnCopyId: copy.id },
                }}
                key={entry.id}
              >
                <Pressable accessibilityRole="button" style={styles.journalEntry}>
                  <View style={styles.entryMetaRow}>
                    <Text style={styles.entryType}>{getJournalEntryTypeLabel(entry.type)}</Text>
                    <Text style={styles.entryDate}>{formatJournalTimestamp(entry.occurredAt)}</Text>
                  </View>
                  <Text style={styles.entryTitle}>{getJournalEntryTitle(entry)}</Text>
                  <Text style={styles.body}>{entry.body}</Text>
                </Pressable>
              </Link>
            ))
          ) : (
            <EmptyState
              title="No Journal entries yet"
              body="This Copy still has room to gather notes, memories, and listening moments."
            />
          )}
        </View>
      </AnimatedAppear>
    </Screen>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
    minHeight: 292,
    overflow: "hidden",
  },
  heroGlow: {
    borderRadius: 140,
    height: 260,
    opacity: 0.34,
    position: "absolute",
    transform: [{ scale: 1.08 }],
    width: 260,
  },
  heroCopy: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
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
  artist: {
    ...typography.heading,
    color: colors.creamMuted,
  },
  body: {
    ...typography.body,
    color: colors.creamMuted,
  },
  editLink: {
    ...typography.subheading,
    alignSelf: "flex-start",
    backgroundColor: colors.ember,
    borderRadius: radii.md,
    color: colors.night,
    marginTop: spacing.md,
    overflow: "hidden",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  snapshot: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  panel: {
    backgroundColor: colors.nightSoft,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.md,
    marginTop: spacing.xl,
    padding: spacing.lg,
  },
  panelTitle: {
    ...typography.subheading,
    color: colors.cream,
  },
  panelHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  inlineLink: {
    ...typography.caption,
    color: colors.ember,
    textDecorationLine: "underline",
  },
  detail: {
    backgroundColor: colors.nightSoft,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flex: 1,
    gap: spacing.xs,
    minHeight: 86,
    padding: spacing.md,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.ember,
    textTransform: "uppercase",
  },
  detailValue: {
    ...typography.subheading,
    color: colors.cream,
  },
  acquired: {
    ...typography.caption,
    color: colors.ember,
    textTransform: "uppercase",
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  journalEntry: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    gap: spacing.xs,
    paddingTop: spacing.md,
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
});
