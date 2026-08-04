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

export type JournalEntryType = "note" | "memory" | "listening_event" | "purchase";

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
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type Crate = {
  id: string;
  name: string;
  description: string;
  coverBehavior: "auto" | "generated";
  copyIds: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type Tag = {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type JournalEntry = {
  id: string;
  copyId: string;
  type: JournalEntryType;
  title: string;
  body: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type CopyWithRelease = Copy & {
  release: Release | null;
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
