import { colors } from "@/design/tokens";
import type { ArtworkSwatch, CopyWithRelease } from "@/types/domain";

export function getCopyTitle(copy: CopyWithRelease) {
  return copy.release?.title ?? copy.titleOverride ?? "Untitled Copy";
}

export function getCopyArtist(copy: CopyWithRelease) {
  return copy.release?.primaryArtistName ?? copy.artistOverride ?? "Unknown Artist";
}

export function getCopyYear(copy: CopyWithRelease) {
  return copy.yearOverride ?? copy.release?.year ?? null;
}

export function getCopyLabel(copy: CopyWithRelease) {
  return copy.release?.label ?? "Custom";
}

export function getCopyFormat(copy: CopyWithRelease) {
  return copy.mediaType || copy.release?.format || "Unknown Format";
}

export function getCopyGenre(copy: CopyWithRelease) {
  return copy.release?.genre ?? "Custom";
}

export function getCopyArtwork(copy: CopyWithRelease): ArtworkSwatch {
  if (copy.release) {
    return copy.release.artwork;
  }

  const title = getCopyTitle(copy);
  const artist = getCopyArtist(copy);

  return {
    backgroundColor: colors.nightRaised,
    accentColor: colors.ember,
    initials: getArtworkInitials(title, artist),
  };
}

function getArtworkInitials(title: string, artist: string) {
  const words = `${artist} ${title}`
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .slice(0, 2);

  return words.map((word) => word[0]?.toUpperCase()).join("") || "CR";
}
