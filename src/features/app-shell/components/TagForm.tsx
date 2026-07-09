import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { colors, radii, spacing, typography } from "@/design/tokens";
import type { Tag } from "@/types/domain";

export type TagFormValues = {
  name: string;
  color: string;
};

type TagFormProps = {
  initialValues?: Partial<Tag>;
  isSaving: boolean;
  submitLabel: string;
  savingLabel: string;
  onSubmit: (values: TagFormValues) => Promise<void>;
};

export const tagColorPresets = [
  colors.ember,
  colors.clay,
  colors.moss,
  colors.brass,
  colors.plum,
] as const;

export function TagForm({
  initialValues,
  isSaving,
  submitLabel,
  savingLabel,
  onSubmit,
}: TagFormProps) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [color, setColor] = useState(initialValues?.color ?? colors.ember);
  const [validationError, setValidationError] = useState<string | undefined>();

  async function submit() {
    const cleanName = name.trim();

    if (!cleanName) {
      setValidationError("Tag name is required.");
      return;
    }

    setValidationError(undefined);

    try {
      await onSubmit({ name: cleanName, color });
      if (!initialValues?.id) {
        setName("");
        setColor(colors.ember);
      }
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : "Unable to save this Tag.");
    }
  }

  return (
    <View style={styles.form}>
      <View style={styles.field}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          onChangeText={setName}
          placeholder="Tag name"
          placeholderTextColor={colors.inkMuted}
          style={styles.input}
          value={name}
        />
      </View>

      <Text style={styles.label}>Color</Text>
      <View style={styles.swatchRow}>
        {tagColorPresets.map((preset) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Use color ${preset}`}
            key={preset}
            onPress={() => setColor(preset)}
            style={[
              styles.swatch,
              { backgroundColor: preset },
              color === preset && styles.swatchSelected,
            ]}
          />
        ))}
      </View>

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

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
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
  swatchRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  swatch: {
    borderColor: colors.borderStrong,
    borderRadius: radii.sm,
    borderWidth: 1,
    height: 36,
    width: 48,
  },
  swatchSelected: {
    borderColor: colors.cream,
    borderWidth: 2,
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
    minHeight: 50,
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
