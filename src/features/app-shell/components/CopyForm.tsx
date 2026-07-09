import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { EmptyState } from "@/components/EmptyState";
import { colors, radii, spacing, typography } from "@/design/tokens";
import type { Crate, Tag } from "@/types/domain";

export type CopyFormValues = {
  title: string;
  artist: string;
  mediaType: string;
  year?: number;
  conditionMedia?: string;
  conditionSleeve?: string;
  rating?: number;
  tagIds: string[];
  crateIds: string[];
  initialJournalNote?: string;
};

export type CopyFormInitialValues = {
  title?: string;
  artist?: string;
  mediaType?: string;
  year?: number | null;
  conditionMedia?: string | null;
  conditionSleeve?: string | null;
  rating?: number;
  tagIds?: string[];
  crateIds?: string[];
  initialJournalNote?: string;
};

type CopyFormProps = {
  crates: Crate[];
  tags: Tag[];
  initialValues?: CopyFormInitialValues;
  isSaving: boolean;
  optionsError?: Error;
  optionsLoading?: boolean;
  submitLabel: string;
  savingLabel: string;
  showInitialJournalNote?: boolean;
  onSubmit: (values: CopyFormValues) => Promise<void>;
};

const mediaTypes = ["Vinyl", "CD", "Cassette", "Other"];
const conditionGrades = ["M", "NM", "VG+", "VG", "G+", "G", "F", "P"];
const ratings = [1, 2, 3, 4, 5];

export function CopyForm({
  crates,
  tags,
  initialValues,
  isSaving,
  optionsError,
  optionsLoading,
  submitLabel,
  savingLabel,
  showInitialJournalNote = false,
  onSubmit,
}: CopyFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [artist, setArtist] = useState(initialValues?.artist ?? "");
  const [mediaType, setMediaType] = useState(initialValues?.mediaType ?? "Vinyl");
  const [year, setYear] = useState(initialValues?.year ? `${initialValues.year}` : "");
  const [conditionMedia, setConditionMedia] = useState(initialValues?.conditionMedia ?? "");
  const [conditionSleeve, setConditionSleeve] = useState(initialValues?.conditionSleeve ?? "");
  const [rating, setRating] = useState<number | undefined>(initialValues?.rating || undefined);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(initialValues?.tagIds ?? []);
  const [selectedCrateIds, setSelectedCrateIds] = useState<string[]>(initialValues?.crateIds ?? []);
  const [initialJournalNote, setInitialJournalNote] = useState(
    initialValues?.initialJournalNote ?? "",
  );
  const [validationError, setValidationError] = useState<string | undefined>();

  async function submit() {
    const cleanTitle = title.trim();
    const cleanArtist = artist.trim();
    const cleanMediaType = mediaType.trim();

    if (!cleanTitle || !cleanArtist || !cleanMediaType) {
      setValidationError("Title, artist, and media type are required.");
      return;
    }

    const parsedYear = year.trim() ? Number(year.trim()) : undefined;

    if (parsedYear !== undefined && (!Number.isInteger(parsedYear) || parsedYear < 0)) {
      setValidationError("Year must be a whole number.");
      return;
    }

    setValidationError(undefined);

    try {
      await onSubmit({
        title: cleanTitle,
        artist: cleanArtist,
        mediaType: cleanMediaType,
        year: parsedYear,
        conditionMedia: conditionMedia.trim() || undefined,
        conditionSleeve: conditionSleeve.trim() || undefined,
        rating,
        tagIds: selectedTagIds,
        crateIds: selectedCrateIds,
        initialJournalNote: initialJournalNote.trim() || undefined,
      });
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : "Unable to save this Copy.");
    }
  }

  function toggleSelected(
    id: string,
    selectedIds: string[],
    setSelectedIds: (ids: string[]) => void,
  ) {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
      return;
    }

    setSelectedIds([...selectedIds, id]);
  }

  return (
    <View style={styles.form}>
      <Field
        label="Title"
        value={title}
        onChangeText={setTitle}
        placeholder="Album or release title"
      />
      <Field label="Artist" value={artist} onChangeText={setArtist} placeholder="Primary artist" />

      <Text style={styles.label}>Media type</Text>
      <View style={styles.chipRow}>
        {mediaTypes.map((type) => (
          <ChoiceChip
            key={type}
            label={type}
            selected={mediaType === type}
            onPress={() => setMediaType(type)}
          />
        ))}
      </View>

      <Field
        label="Year"
        value={year}
        onChangeText={setYear}
        placeholder="Optional"
        keyboardType="number-pad"
      />

      <Text style={styles.label}>Media condition</Text>
      <View style={styles.chipRow}>
        {conditionGrades.map((grade) => (
          <ChoiceChip
            key={grade}
            label={grade}
            selected={conditionMedia === grade}
            onPress={() => setConditionMedia(conditionMedia === grade ? "" : grade)}
          />
        ))}
      </View>

      <Text style={styles.label}>Sleeve condition</Text>
      <View style={styles.chipRow}>
        {conditionGrades.map((grade) => (
          <ChoiceChip
            key={grade}
            label={grade}
            selected={conditionSleeve === grade}
            onPress={() => setConditionSleeve(conditionSleeve === grade ? "" : grade)}
          />
        ))}
      </View>

      <Text style={styles.label}>Rating</Text>
      <View style={styles.chipRow}>
        {ratings.map((value) => (
          <ChoiceChip
            key={value}
            label={`${value}`}
            selected={rating === value}
            onPress={() => setRating(rating === value ? undefined : value)}
          />
        ))}
      </View>

      {optionsLoading ? (
        <EmptyState
          title="Loading Crates and Tags"
          body="Reading local organization options from SQLite."
        />
      ) : optionsError ? (
        <EmptyState title="Options unavailable" body={optionsError.message} />
      ) : (
        <>
          <Text style={styles.label}>Tags</Text>
          <Link href="/settings/tags" style={styles.manageLink}>
            Manage Tags
          </Link>
          <View style={styles.chipRow}>
            {tags.map((tag) => (
              <ChoiceChip
                key={tag.id}
                color={tag.color}
                label={tag.name}
                selected={selectedTagIds.includes(tag.id)}
                onPress={() => toggleSelected(tag.id, selectedTagIds, setSelectedTagIds)}
              />
            ))}
          </View>

          <Text style={styles.label}>Crates</Text>
          <View style={styles.chipRow}>
            {crates.map((crate) => (
              <ChoiceChip
                key={crate.id}
                label={crate.name}
                selected={selectedCrateIds.includes(crate.id)}
                onPress={() => toggleSelected(crate.id, selectedCrateIds, setSelectedCrateIds)}
              />
            ))}
          </View>
        </>
      )}

      {showInitialJournalNote ? (
        <Field
          label="Initial Journal note"
          value={initialJournalNote}
          onChangeText={setInitialJournalNote}
          placeholder="Optional memory, note, or context"
          multiline
        />
      ) : null}

      {validationError ? <Text style={styles.error}>{validationError}</Text> : null}

      <Pressable
        accessibilityRole="button"
        disabled={isSaving}
        onPress={submit}
        style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
      >
        <Text style={styles.saveButtonText}>{isSaving ? savingLabel : submitLabel}</Text>
      </Pressable>
    </View>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: "default" | "number-pad";
  multiline?: boolean;
};

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  multiline = false,
}: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        keyboardType={keyboardType}
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inkMuted}
        style={[styles.input, multiline && styles.multilineInput]}
        value={value}
      />
    </View>
  );
}

function ChoiceChip({
  color,
  label,
  selected,
  onPress,
}: {
  color?: string;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        color
          ? {
              backgroundColor: `${color}18`,
              borderColor: `${color}55`,
            }
          : null,
        selected && styles.chipSelected,
      ]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.lg,
    marginTop: spacing.xl,
  },
  field: {
    gap: spacing.sm,
  },
  label: {
    ...typography.caption,
    color: colors.ember,
    textTransform: "uppercase",
  },
  manageLink: {
    ...typography.caption,
    alignSelf: "flex-start",
    color: colors.cream,
    marginTop: -spacing.sm,
    textDecorationLine: "underline",
  },
  input: {
    ...typography.body,
    backgroundColor: colors.nightSoft,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.cream,
    minHeight: 52,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  multilineInput: {
    minHeight: 108,
    textAlignVertical: "top",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.nightSoft,
    borderColor: colors.border,
    borderRadius: radii.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipSelected: {
    backgroundColor: "rgba(210, 154, 90, 0.16)",
    borderColor: colors.ember,
  },
  chipText: {
    ...typography.caption,
    color: colors.creamMuted,
  },
  chipTextSelected: {
    color: colors.cream,
  },
  error: {
    ...typography.body,
    color: "#f2a39a",
  },
  saveButton: {
    alignItems: "center",
    backgroundColor: colors.ember,
    borderRadius: radii.md,
    minHeight: 54,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  saveButtonDisabled: {
    opacity: 0.64,
  },
  saveButtonText: {
    ...typography.subheading,
    color: colors.night,
  },
});
