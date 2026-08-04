import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ArtworkTile } from "@/components/ArtworkTile";
import { TagPill } from "@/components/TagPill";
import { colors, radii, spacing, typography } from "@/design/tokens";
import type { CopyWithRelease } from "@/types/domain";
import {
  getCopyArtist,
  getCopyArtwork,
  getCopyFormat,
  getCopyTitle,
  getCopyYear,
} from "@/utils/copyDisplay";

type CopyRowProps = {
  copy: CopyWithRelease;
};

export function CopyRow({ copy }: CopyRowProps) {
  const copyYear = getCopyYear(copy);
  const releaseYear = copyYear ? `${copyYear} · ` : "";

  return (
    <Link href={`/copy/${copy.id}`} asChild>
      <Pressable style={styles.row}>
        <ArtworkTile artwork={getCopyArtwork(copy)} size="sm" />
        <View style={styles.details}>
          <Text style={styles.title}>{getCopyTitle(copy)}</Text>
          <Text style={styles.artist}>{getCopyArtist(copy)}</Text>
          <View style={styles.metaRow}>
            <TagPill label={copy.condition} tone="warm" />
            <Text style={styles.meta}>
              {releaseYear}
              {getCopyFormat(copy)}
            </Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    backgroundColor: colors.nightSoft,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    minHeight: 88,
    padding: spacing.md,
  },
  details: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...typography.subheading,
    color: colors.cream,
  },
  artist: {
    ...typography.body,
    color: colors.creamMuted,
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  meta: {
    ...typography.caption,
    color: colors.inkMuted,
  },
});
