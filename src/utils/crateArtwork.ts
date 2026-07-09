import { colors } from "@/design/tokens";
import type { ArtworkSwatch, CopyWithRelease, Crate } from "@/types/domain";

export function getGeneratedCrateArtwork(crate: Pick<Crate, "name">): ArtworkSwatch {
  return {
    backgroundColor: colors.nightRaised,
    accentColor: colors.ember,
    initials: getInitials(crate.name),
  };
}

export function getCrateArtwork(crate: Crate, copies: CopyWithRelease[]): ArtworkSwatch[] {
  if (crate.coverBehavior === "generated" || copies.length === 0) {
    return [getGeneratedCrateArtwork(crate)];
  }

  return copies.slice(0, 3).map((copy) => copy.release.artwork);
}

function getInitials(value: string) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  const initials = words.slice(0, 2).map((word) => word[0]?.toUpperCase() ?? "");

  return initials.join("") || "CR";
}
