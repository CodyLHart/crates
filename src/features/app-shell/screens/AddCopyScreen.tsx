import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { AppHeader } from "@/components/AppHeader";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import { createCustomCopy, listCrates, listTags } from "@/db/repositories";
import { colors, radii, spacing, typography } from "@/design/tokens";
import { useAsyncData } from "@/hooks/useAsyncData";

const mediaTypes = ["Vinyl", "CD", "Cassette", "Other"];
const conditionGrades = ["M", "NM", "VG+", "VG", "G+", "G", "F", "P"];
const ratings = [1, 2, 3, 4, 5];

export function AddCopyScreen() {
  const router = useRouter();
  const { data, error, isLoading } = useAsyncData(async () => {
    const [crates, tags] = await Promise.all([listCrates(), listTags()]);

    return { crates, tags };
  }, []);

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [mediaType, setMediaType] = useState("Vinyl");
  const [year, setYear] = useState("");
  const [conditionMedia, setConditionMedia] = useState("");
  const [conditionSleeve, setConditionSleeve] = useState("");
  const [rating, setRating] = useState<number | undefined>();
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [selectedCrateIds, setSelectedCrateIds] = useState<string[]>([]);
  const [initialJournalNote, setInitialJournalNote] = useState("");
  const [validationError, setValidationError] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);

  async function saveCopy() {
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
    setIsSaving(true);

    try {
      const copyId = await createCustomCopy({
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

      router.replace({
        pathname: "/copy/[id]",
        params: { id: copyId },
      });
    } catch (saveError) {
      setValidationError(
        saveError instanceof Error ? saveError.message : "Unable to save this Copy.",
      );
    } finally {
      setIsSaving(false);
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
    <Screen>
      <AppHeader title="Add Copy" subtitle="Create a local custom Copy" showBack />
      <Text style={styles.title}>Add the record in your hand.</Text>
      <Text style={styles.body}>
        Start with the essentials. Discogs, sync, and artwork upload can come later.
      </Text>

      <View style={styles.form}>
        <Field
          label="Title"
          value={title}
          onChangeText={setTitle}
          placeholder="Album or release title"
        />
        <Field
          label="Artist"
          value={artist}
          onChangeText={setArtist}
          placeholder="Primary artist"
        />

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

        {isLoading ? (
          <EmptyState
            title="Loading Crates and Tags"
            body="Reading local organization options from SQLite."
          />
        ) : error ? (
          <EmptyState title="Options unavailable" body={error.message} />
        ) : (
          <>
            <Text style={styles.label}>Tags</Text>
            <View style={styles.chipRow}>
              {data?.tags.map((tag) => (
                <ChoiceChip
                  key={tag.id}
                  label={tag.name}
                  selected={selectedTagIds.includes(tag.id)}
                  onPress={() => toggleSelected(tag.id, selectedTagIds, setSelectedTagIds)}
                />
              ))}
            </View>

            <Text style={styles.label}>Crates</Text>
            <View style={styles.chipRow}>
              {data?.crates.map((crate) => (
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

        <Field
          label="Initial Journal note"
          value={initialJournalNote}
          onChangeText={setInitialJournalNote}
          placeholder="Optional memory, note, or context"
          multiline
        />

        {validationError ? <Text style={styles.error}>{validationError}</Text> : null}

        <Pressable
          accessibilityRole="button"
          disabled={isSaving}
          onPress={saveCopy}
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
        >
          <Text style={styles.saveButtonText}>{isSaving ? "Saving..." : "Save Copy"}</Text>
        </Pressable>
      </View>
    </Screen>
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
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.title,
    color: colors.cream,
  },
  body: {
    ...typography.body,
    color: colors.creamMuted,
    marginTop: spacing.md,
  },
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
