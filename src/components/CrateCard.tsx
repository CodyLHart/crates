import { StyleSheet, Text, View } from "react-native";

import { ArtworkTile } from "@/components/ArtworkTile";
import type { CopyWithRelease, Crate } from "@/constants/demoData";
import { colors, radii, spacing, typography } from "@/design/tokens";

type CrateCardProps = {
  crate: Crate;
  copies: CopyWithRelease[];
};

export function CrateCard({ crate, copies }: CrateCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.artworkStack}>
        {copies.slice(0, 3).map((copy) => (
          <ArtworkTile key={copy.id} artwork={copy.release.artwork} size="sm" />
        ))}
      </View>
      <Text style={styles.name}>{crate.name}</Text>
      <Text style={styles.description}>{crate.description}</Text>
      <Text style={styles.count}>{copies.length} Copies</Text>
    </View>
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
