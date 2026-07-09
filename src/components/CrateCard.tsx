import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ArtworkTile } from "@/components/ArtworkTile";
import { colors, radii, spacing, typography } from "@/design/tokens";
import type { CopyWithRelease, Crate } from "@/types/domain";
import { getCrateArtwork } from "@/utils/crateArtwork";

type CrateCardProps = {
  crate: Crate;
  copies: CopyWithRelease[];
};

export function CrateCard({ crate, copies }: CrateCardProps) {
  const artwork = getCrateArtwork(crate, copies);

  return (
    <Link href={`/crate/${crate.id}`} asChild>
      <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
        <View style={styles.artworkStack}>
          {artwork.map((swatch, index) => (
            <ArtworkTile key={`${crate.id}-${index}`} artwork={swatch} size="sm" />
          ))}
        </View>
        <Text style={styles.name}>{crate.name}</Text>
        <Text style={styles.description}>{crate.description}</Text>
        <Text style={styles.count}>{copies.length} Copies</Text>
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
    gap: spacing.sm,
    padding: spacing.md,
  },
  cardPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.992 }],
  },
  artworkStack: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  name: {
    ...typography.subheading,
    color: colors.cream,
  },
  description: {
    ...typography.body,
    color: colors.creamMuted,
  },
  count: {
    ...typography.caption,
    color: colors.ember,
    marginTop: spacing.xs,
    textTransform: "uppercase",
  },
});
