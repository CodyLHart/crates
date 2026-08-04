import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ArtworkTile } from "@/components/ArtworkTile";
import { EmptyState } from "@/components/EmptyState";
import { colors, radii, spacing, typography } from "@/design/tokens";
import type { SaveJournalEntryInput } from "@/db/repositories";
import type { CopyWithRelease, JournalEntryType } from "@/types/domain";
import { getCopyArtist, getCopyArtwork, getCopyTitle } from "@/utils/copyDisplay";
import {
  journalEntryTypeOptions,
  parseJournalDateTimeInput,
  toJournalDateTimeInputValue,
} from "@/utils/journalDisplay";

export type JournalEntryFormInitialValues = {
  copyId?: string;
  type?: JournalEntryType;
  title?: string;
  body?: string;
  occurredAt?: string;
};

type JournalEntryFormProps = {
  copies: CopyWithRelease[];
  fixedCopyId?: string;
  initialValues?: JournalEntryFormInitialValues;
  isSaving: boolean;
  optionsError?: Error;
  optionsLoading?: boolean;
  submitLabel: string;
  savingLabel: string;
  deleteAction?: {
    label: string;
    isDeleting: boolean;
    onDelete: () => Promise<void>;
  };
  onSubmit: (values: SaveJournalEntryInput) => Promise<void>;
};

const bodyPlaceholders: Record<JournalEntryType, string> = {
  note: "What should you remember about this Copy?",
  memory: "What happened around this Copy?",
  purchase: "Where did it come from?",
  listening_event: "What did listening to it feel like?",
};

export function JournalEntryForm({
  copies,
  fixedCopyId,
  initialValues,
  isSaving,
  optionsError,
  optionsLoading,
  submitLabel,
  savingLabel,
  deleteAction,
  onSubmit,
}: JournalEntryFormProps) {
  const [selectedCopyId, setSelectedCopyId] = useState(
    fixedCopyId ?? initialValues?.copyId ?? copies[0]?.id ?? "",
  );
  const [type, setType] = useState<JournalEntryType>(initialValues?.type ?? "note");
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [body, setBody] = useState(initialValues?.body ?? "");
  const [occurredAt, setOccurredAt] = useState(
    initialValues?.occurredAt
      ? toJournalDateTimeInputValue(initialValues.occurredAt)
      : toJournalDateTimeInputValue(new Date().toISOString()),
  );
  const [validationError, setValidationError] = useState<string | undefined>();

  const selectedCopy = copies.find((copy) => copy.id === selectedCopyId);

  async function submit() {
    const parsedOccurredAt = parseJournalDateTimeInput(occurredAt);

    if (!selectedCopyId) {
      setValidationError("Choose a Copy for this Journal entry.");
      return;
    }

    if (!body.trim()) {
      setValidationError("Add a note or description before saving.");
      return;
    }

    if (!parsedOccurredAt) {
      setValidationError("Use a valid occurred date and time.");
      return;
    }

    setValidationError(undefined);

    try {
      await onSubmit({
        copyId: selectedCopyId,
        type,
        title: title.trim() || undefined,
        body: body.trim(),
        occurredAt: parsedOccurredAt,
      });
    } catch (error) {
      setValidationError(
        error instanceof Error ? error.message : "Unable to save this Journal entry.",
      );
    }
  }

  async function deleteEntry() {
    if (!deleteAction) {
      return;
    }

    setValidationError(undefined);

    try {
      await deleteAction.onDelete();
    } catch (error) {
      setValidationError(
        error instanceof Error ? error.message : "Unable to delete this Journal entry.",
      );
    }
  }

  return (
    <View style={styles.form}>
      {optionsLoading ? (
        <EmptyState title="Loading Copies" body="Reading local Copies from SQLite." />
      ) : optionsError ? (
        <EmptyState title="Copies unavailable" body={optionsError.message} />
      ) : (
        <>
          <Text style={styles.label}>Copy</Text>
          {fixedCopyId && selectedCopy ? (
            <SelectedCopy copy={selectedCopy} />
          ) : (
            <View style={styles.copyList}>
              {copies.map((copy) => (
                <Pressable
                  accessibilityRole="button"
                  key={copy.id}
                  onPress={() => setSelectedCopyId(copy.id)}
                  style={[styles.copyChoice, selectedCopyId === copy.id && styles.copySelected]}
                >
                  <ArtworkTile artwork={getCopyArtwork(copy)} size="sm" />
                  <View style={styles.copyText}>
                    <Text style={styles.copyTitle}>{getCopyTitle(copy)}</Text>
                    <Text style={styles.copyArtist}>{getCopyArtist(copy)}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </>
      )}

      <Text style={styles.label}>Entry type</Text>
      <View style={styles.chipRow}>
        {journalEntryTypeOptions.map((option) => (
          <ChoiceChip
            key={option.value}
            label={option.label}
            selected={type === option.value}
            onPress={() => setType(option.value)}
          />
        ))}
      </View>

      <Field label="Title" value={title} onChangeText={setTitle} placeholder="Optional" />
      <Field
        label="Description"
        value={body}
        onChangeText={setBody}
        placeholder={bodyPlaceholders[type]}
        multiline
      />
      <Field
        label="Occurred"
        value={occurredAt}
        onChangeText={setOccurredAt}
        placeholder="YYYY-MM-DD HH:MM"
      />

      {validationError ? <Text style={styles.error}>{validationError}</Text> : null}

      <Pressable
        accessibilityRole="button"
        disabled={isSaving || !copies.length}
        onPress={submit}
        style={[styles.saveButton, (isSaving || !copies.length) && styles.buttonDisabled]}
      >
        <Text style={styles.saveButtonText}>{isSaving ? savingLabel : submitLabel}</Text>
      </Pressable>

      {deleteAction ? (
        <Pressable
          accessibilityRole="button"
          disabled={deleteAction.isDeleting}
          onPress={deleteEntry}
          style={[styles.deleteButton, deleteAction.isDeleting && styles.buttonDisabled]}
        >
          <Text style={styles.deleteButtonText}>
            {deleteAction.isDeleting ? "Deleting..." : deleteAction.label}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function SelectedCopy({ copy }: { copy: CopyWithRelease }) {
  return (
    <View style={styles.copyChoice}>
      <ArtworkTile artwork={getCopyArtwork(copy)} size="sm" />
      <View style={styles.copyText}>
        <Text style={styles.copyTitle}>{getCopyTitle(copy)}</Text>
        <Text style={styles.copyArtist}>{getCopyArtist(copy)}</Text>
      </View>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
}) {
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
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
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
  label: {
    ...typography.caption,
    color: colors.ember,
    textTransform: "uppercase",
  },
  field: {
    gap: spacing.sm,
  },
  copyList: {
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
    minHeight: 84,
    padding: spacing.md,
  },
  copySelected: {
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
    ...typography.caption,
    color: colors.inkMuted,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.nightSoft,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipSelected: {
    backgroundColor: colors.ember,
    borderColor: colors.ember,
  },
  chipText: {
    ...typography.caption,
    color: colors.creamMuted,
  },
  chipTextSelected: {
    color: colors.night,
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
    minHeight: 132,
    textAlignVertical: "top",
  },
  saveButton: {
    alignItems: "center",
    backgroundColor: colors.ember,
    borderRadius: radii.md,
    minHeight: 52,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  saveButtonText: {
    ...typography.subheading,
    color: colors.night,
  },
  deleteButton: {
    alignItems: "center",
    borderColor: colors.borderStrong,
    borderRadius: radii.md,
    borderWidth: 1,
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  deleteButtonText: {
    ...typography.subheading,
    color: colors.cream,
  },
  buttonDisabled: {
    opacity: 0.62,
  },
  error: {
    ...typography.body,
    color: colors.ember,
  },
});
