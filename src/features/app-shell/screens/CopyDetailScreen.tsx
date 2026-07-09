import { StyleSheet, Text, View } from "react-native";

import { AnimatedAppear } from "@/components/AnimatedAppear";
import { AppHeader } from "@/components/AppHeader";
import { ArtworkTile } from "@/components/ArtworkTile";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import { TagPill } from "@/components/TagPill";
import type { CopyWithRelease } from "@/constants/demoData";
import { colors, radii, spacing, typography } from "@/design/tokens";

type CopyDetailScreenProps = {
  copy?: CopyWithRelease;
};

export function CopyDetailScreen({ copy }: CopyDetailScreenProps) {
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

  return (
    <Screen>
      <AppHeader title="Copy" subtitle={copy.release.primaryArtistName} showBack />
      <AnimatedAppear>
        <View style={styles.hero}>
          <View
            style={[
              styles.heroGlow,
              {
                backgroundColor: copy.release.artwork.backgroundColor,
              },
            ]}
          />
          <ArtworkTile artwork={copy.release.artwork} size="xl" />
        </View>
      </AnimatedAppear>

      <AnimatedAppear delay={80}>
        <View style={styles.heroCopy}>
          <Text style={styles.eyebrow}>Now Viewing</Text>
          <Text style={styles.title}>{copy.release.title}</Text>
          <Text style={styles.artist}>{copy.release.primaryArtistName}</Text>
          <Text style={styles.body}>
            {copy.release.year} · {copy.release.label} · {copy.release.format} ·{" "}
            {copy.release.genre}
          </Text>
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
              <TagPill key={tag.id} label={tag.name} />
            ))}
          </View>
        </View>
      </AnimatedAppear>

      <AnimatedAppear delay={320}>
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Journal</Text>
          {copy.journalEntries.length ? (
            copy.journalEntries.map((entry) => (
              <View key={entry.id} style={styles.journalEntry}>
                <Text style={styles.entryType}>{entry.type}</Text>
                <Text style={styles.entryTitle}>{entry.title}</Text>
                <Text style={styles.body}>{entry.body}</Text>
              </View>
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
  entryType: {
    ...typography.caption,
    color: colors.ember,
    textTransform: "uppercase",
  },
  entryTitle: {
    ...typography.subheading,
    color: colors.cream,
  },
});
