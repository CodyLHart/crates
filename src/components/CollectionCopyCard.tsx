import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ArtworkTile } from "@/components/ArtworkTile";
import { TagPill } from "@/components/TagPill";
import { colors, radii, spacing, typography } from "@/design/tokens";
import type { CopyWithRelease } from "@/types/domain";

type CollectionCopyCardProps = {
  copy: CopyWithRelease;
  featured?: boolean;
};

export function CollectionCopyCard({ copy, featured = false }: CollectionCopyCardProps) {
  return (
    <Link href={`/copy/${copy.id}`} asChild>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          featured && styles.featuredCard,
          pressed && styles.cardPressed,
        ]}
      >
        <ArtworkTile artwork={copy.release.artwork} size={featured ? "lg" : "md"} />
        <View style={styles.copy}>
          <Text style={featured ? styles.featuredTitle : styles.title}>{copy.release.title}</Text>
          <Text style={styles.artist}>{copy.release.primaryArtistName}</Text>
          <View style={styles.metaRow}>
            <TagPill label={copy.release.genre} tone="warm" />
            <Text style={styles.meta}>
              {copy.condition} · {copy.release.format}
            </Text>
          </View>
          {featured ? <Text style={styles.note}>{copy.personalNote}</Text> : null}
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.nightSoft,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    minHeight: 128,
    padding: spacing.md,
  },
  featuredCard: {
    alignItems: "flex-end",
    backgroundColor: colors.nightRaised,
    gap: spacing.lg,
    minHeight: 220,
    padding: spacing.lg,
  },
  cardPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.992 }],
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
    justifyContent: "flex-end",
  },
  title: {
    ...typography.subheading,
    color: colors.cream,
  },
  featuredTitle: {
    ...typography.heading,
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
  note: {
    ...typography.body,
    color: colors.creamMuted,
    marginTop: spacing.sm,
  },
});
