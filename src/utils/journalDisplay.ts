import type { JournalEntry, JournalEntryType } from "@/types/domain";

export const journalEntryTypeOptions: { label: string; value: JournalEntryType }[] = [
  { label: "Note", value: "note" },
  { label: "Memory", value: "memory" },
  { label: "Purchase", value: "purchase" },
  { label: "Listening", value: "listening_event" },
];

export function getJournalEntryTypeLabel(type: JournalEntryType) {
  return journalEntryTypeOptions.find((option) => option.value === type)?.label ?? "Note";
}

export function getJournalEntryTitle(entry: Pick<JournalEntry, "title" | "type">) {
  const title = entry.title.trim();

  return title || getJournalEntryTypeLabel(entry.type);
}

export function formatJournalTimestamp(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatJournalDateHeading(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "full",
  }).format(date);
}

export function toJournalDateTimeInputValue(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function parseJournalDateTimeInput(value: string) {
  const normalized = value.trim().replace(" ", "T");
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString();
}
