import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { ArtworkTile } from "@/components/ArtworkTile";
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
        <Text style={styles.eyebrow}>Copy</Text>
        <Text style={styles.title}>Copy not found.</Text>
        <Link href="/(tabs)/collection" style={styles.backLink}>
          Back to Collection
        </Link>
      </Screen>
    );
  }

  return (
    <Screen>
      <Link href="/(tabs)/collection" style={styles.backLink}>
        Collection
      </Link>
      <View style={styles.hero}>
        <ArtworkTile artwork={copy.release.artwork} size="lg" />
        <View style={styles.heroCopy}>
          <Text style={styles.eyebrow}>Copy Detail</Text>
          <Text style={styles.title}>{copy.release.title}</Text>
          <Text style={styles.artist}>{copy.release.primaryArtistName}</Text>
          <Text style={styles.body}>
            {copy.release.year} · {copy.release.label} · {copy.release.format}
          </Text>
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Ownership</Text>
        <Text style={styles.body}>{copy.personalNote}</Text>
        <View style={styles.metaGrid}>
          <Detail label="Condition" value={copy.condition} />
          <Detail label="Rating" value={`${copy.rating}/5`} />
          <Detail label="Acquired" value={copy.acquiredFrom} />
          <Detail label="Last Played" value={copy.lastPlayedAt} />
        </View>
      </View>

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

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Journal</Text>
        {copy.journalEntries.map((entry) => (
          <View key={entry.id} style={styles.journalEntry}>
            <Text style={styles.entryType}>{entry.type}</Text>
            <Text style={styles.entryTitle}>{entry.title}</Text>
            <Text style={styles.body}>{entry.body}</Text>
          </View>
        ))}
      </View>
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
  backLink: {
    ...typography.caption,
    color: colors.ember,
    marginBottom: spacing.lg,
  },
  hero: {
    gap: spacing.lg,
  },
  heroCopy: {
    gap: spacing.sm,
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
  metaGrid: {
    gap: spacing.md,
  },
  detail: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    gap: spacing.xs,
    paddingTop: spacing.md,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.ember,
    textTransform: "uppercase",
  },
  detailValue: {
    ...typography.body,
    color: colors.cream,
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
