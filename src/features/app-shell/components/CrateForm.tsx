import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ArtworkTile } from "@/components/ArtworkTile";
import { EmptyState } from "@/components/EmptyState";
import { colors, radii, spacing, typography } from "@/design/tokens";
import type { CopyWithRelease, Crate } from "@/types/domain";

export type CrateFormValues = {
  name: string;
  description: string;
  coverBehavior: Crate["coverBehavior"];
  copyIds: string[];
};

export type CrateFormInitialValues = Partial<CrateFormValues>;

type CrateFormProps = {
  copies: CopyWithRelease[];
  initialValues?: CrateFormInitialValues;
  isSaving: boolean;
  copiesError?: Error;
  copiesLoading?: boolean;
  submitLabel: string;
  savingLabel: string;
  onSubmit: (values: CrateFormValues) => Promise<void>;
};

export function CrateForm({
  copies,
  initialValues,
  isSaving,
  copiesError,
  copiesLoading,
  submitLabel,
  savingLabel,
  onSubmit,
}: CrateFormProps) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [coverBehavior, setCoverBehavior] = useState<Crate["coverBehavior"]>(
    initialValues?.coverBehavior ?? "auto",
  );
  const [selectedCopyIds, setSelectedCopyIds] = useState<string[]>(initialValues?.copyIds ?? []);
  const [validationError, setValidationError] = useState<string | undefined>();

  async function submit() {
    const cleanName = name.trim();
    const cleanDescription = description.trim();

    if (!cleanName) {
      setValidationError("Crate name is required.");
      return;
    }

    setValidationError(undefined);

    try {
      await onSubmit({
        name: cleanName,
        description: cleanDescription,
        coverBehavior,
        copyIds: selectedCopyIds,
      });
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : "Unable to save this Crate.");
    }
  }

  function toggleCopy(copyId: string) {
    if (selectedCopyIds.includes(copyId)) {
      setSelectedCopyIds(selectedCopyIds.filter((selectedCopyId) => selectedCopyId !== copyId));
      return;
    }

    setSelectedCopyIds([...selectedCopyIds, copyId]);
  }

  return (
    <View style={styles.form}>
      <Field label="Name" value={name} onChangeText={setName} placeholder="Crate name" />
      <Field
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="Mood, purpose, or memory"
        multiline
      />

      <Text style={styles.label}>Cover</Text>
      <View style={styles.chipRow}>
        <ChoiceChip
          label="Auto"
          selected={coverBehavior === "auto"}
          onPress={() => setCoverBehavior("auto")}
        />
        <ChoiceChip
          label="Generated"
          selected={coverBehavior === "generated"}
          onPress={() => setCoverBehavior("generated")}
        />
      </View>

      {copiesLoading ? (
        <EmptyState title="Loading Copies" body="Reading your local Collection from SQLite." />
      ) : copiesError ? (
        <EmptyState title="Copies unavailable" body={copiesError.message} />
      ) : copies.length ? (
        <>
          <Text style={styles.label}>Copies</Text>
          <View style={styles.copyStack}>
            {copies.map((copy) => (
              <Pressable
                accessibilityRole="button"
                key={copy.id}
                onPress={() => toggleCopy(copy.id)}
                style={[
                  styles.copyChoice,
                  selectedCopyIds.includes(copy.id) && styles.copyChoiceSelected,
                ]}
              >
                <ArtworkTile artwork={copy.release.artwork} size="sm" />
                <View style={styles.copyText}>
                  <Text style={styles.copyTitle}>{copy.release.title}</Text>
                  <Text style={styles.copyArtist}>{copy.release.primaryArtistName}</Text>
                  <Text style={styles.copyMeta}>
                    {copy.condition} · {copy.release.format}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </>
      ) : (
        <EmptyState title="No Copies yet" body="Add Copies before gathering them into a Crate." />
      )}

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
  multiline?: boolean;
};

function Field({ label, value, onChangeText, placeholder, multiline = false }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
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
    minHeight: 104,
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
  copyStack: {
    gap: spacing.sm,
  },
  copyChoice: {
    alignItems: "center",
    backgroundColor: colors.nightSoft,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    minHeight: 92,
    padding: spacing.md,
  },
  copyChoiceSelected: {
    backgroundColor: "rgba(210, 154, 90, 0.12)",
    borderColor: colors.ember,
  },
  copyText: {
    flex: 1,
    gap: spacing.xs,
  },
  copyTitle: {
    ...typography.subheading,
    color: colors.cream,
  },
  copyArtist: {
    ...typography.body,
    color: colors.creamMuted,
  },
  copyMeta: {
    ...typography.caption,
    color: colors.inkMuted,
  },
  error: {
    ...typography.body,
    color: "#f2a39a",
  },
  saveButton: {
    alignItems: "center",
    backgroundColor: colors.ember,
    borderRadius: radii.md,
    justifyContent: "center",
    minHeight: 54,
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
