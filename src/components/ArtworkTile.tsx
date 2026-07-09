import { StyleSheet, Text, View } from "react-native";

import { colors, radii, typography } from "@/design/tokens";
import type { ArtworkSwatch } from "@/types/domain";

type ArtworkTileProps = {
  artwork: ArtworkSwatch;
  size?: "sm" | "md" | "lg" | "xl";
};

const sizes = {
  sm: 64,
  md: 96,
  lg: 168,
  xl: 260,
} as const;

export function ArtworkTile({ artwork, size = "md" }: ArtworkTileProps) {
  const dimension = sizes[size];

  return (
    <View
      style={[
        styles.tile,
        {
          width: dimension,
          height: dimension,
          backgroundColor: artwork.backgroundColor,
        },
      ]}
    >
      <View style={[styles.band, { backgroundColor: artwork.accentColor }]} />
      <Text style={[styles.initials, (size === "lg" || size === "xl") && styles.initialsLarge]}>
        {artwork.initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  band: {
    height: "34%",
    opacity: 0.36,
  },
  initials: {
    ...typography.subheading,
    color: colors.cream,
    left: 10,
    position: "absolute",
    top: 8,
  },
  initialsLarge: {
    fontSize: 34,
    lineHeight: 40,
    left: 14,
    top: 12,
  },
});
