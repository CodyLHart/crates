export type ArtworkSwatch = {
  backgroundColor: string;
  accentColor: string;
  initials: string;
};

export type Release = {
  id: string;
  title: string;
  primaryArtistName: string;
  year: number | null;
  label: string;
  format: string;
  genre: string;
  artwork: ArtworkSwatch;
};

export type Copy = {
  id: string;
  releaseId: string | null;
  mediaType: string;
  titleOverride: string | null;
  artistOverride: string | null;
  yearOverride: number | null;
  condition: string;
  conditionMedia: string | null;
  conditionSleeve: string | null;
  rating: number;
  acquiredFrom: string;
  acquiredAt: string;
  personalNote: string;
  crateIds: string[];
  tagIds: string[];
  lastPlayedAt: string;
};

export type Crate = {
  id: string;
  name: string;
  description: string;
  coverBehavior: "auto" | "generated";
  copyIds: string[];
};

export type Tag = {
  id: string;
  name: string;
};

export type JournalEntry = {
  id: string;
  copyId: string;
  type: "Memory" | "Note" | "Listening Event" | "Purchase";
  title: string;
  body: string;
  date: string;
};

export type CopyWithRelease = Copy & {
  release: Release;
  crates: Crate[];
  tags: Tag[];
  journalEntries: JournalEntry[];
};

export type JournalEntryWithCopy = JournalEntry & {
  copy: CopyWithRelease;
};

export type CrateWithCopies = {
  crate: Crate;
  copies: CopyWithRelease[];
};
