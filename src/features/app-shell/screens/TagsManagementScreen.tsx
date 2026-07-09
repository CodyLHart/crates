import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { AppHeader } from "@/components/AppHeader";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import { TagPill } from "@/components/TagPill";
import { createTag, deleteTag, listTags, updateTag } from "@/db/repositories";
import { colors, radii, spacing, typography } from "@/design/tokens";
import { TagForm, type TagFormValues } from "@/features/app-shell/components/TagForm";
import { useAsyncData } from "@/hooks/useAsyncData";
import type { Tag } from "@/types/domain";

export function TagsManagementScreen() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [savingTagId, setSavingTagId] = useState<string | undefined>();
  const [editingTagId, setEditingTagId] = useState<string | undefined>();
  const { data: tags = [], error, isLoading } = useAsyncData(listTags, [refreshKey]);

  function refreshTags() {
    setRefreshKey((current) => current + 1);
  }

  async function saveNewTag(values: TagFormValues) {
    setSavingTagId("new");

    try {
      await createTag(values);
      refreshTags();
    } finally {
      setSavingTagId(undefined);
    }
  }

  async function saveExistingTag(tagId: string, values: TagFormValues) {
    setSavingTagId(tagId);

    try {
      await updateTag(tagId, values);
      setEditingTagId(undefined);
      refreshTags();
    } finally {
      setSavingTagId(undefined);
    }
  }

  function confirmDelete(tag: Tag) {
    Alert.alert(
      "Delete Tag?",
      `This removes "${tag.name}" from Copies, but does not delete any Copies.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void removeTag(tag.id);
          },
        },
      ],
    );
  }

  async function removeTag(tagId: string) {
    setSavingTagId(tagId);

    try {
      await deleteTag(tagId);
      refreshTags();
    } finally {
      setSavingTagId(undefined);
    }
  }

  return (
    <Screen>
      <AppHeader title="Tags" subtitle="Manage your local tagging system" showBack />
      <Text style={styles.title}>Shape the labels that make your Collection yours.</Text>
      <Text style={styles.body}>
        Tags stay local for now and can be applied to any Copy from Add Copy or Edit Copy.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>New Tag</Text>
        <TagForm
          isSaving={savingTagId === "new"}
          savingLabel="Saving..."
          submitLabel="Create Tag"
          onSubmit={saveNewTag}
        />
      </View>

      <View style={styles.stack}>
        {isLoading ? (
          <EmptyState title="Loading Tags" body="Reading local Tags from SQLite." />
        ) : error ? (
          <EmptyState title="Tags unavailable" body={error.message} />
        ) : tags.length ? (
          tags.map((tag) => (
            <View key={tag.id} style={styles.card}>
              <View style={styles.tagHeader}>
                <TagPill color={tag.color} label={tag.name} />
                <View style={styles.actionRow}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setEditingTagId(editingTagId === tag.id ? undefined : tag.id)}
                    style={styles.secondaryButton}
                  >
                    <Text style={styles.secondaryButtonText}>
                      {editingTagId === tag.id ? "Cancel" : "Edit"}
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    disabled={savingTagId === tag.id}
                    onPress={() => confirmDelete(tag)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteButtonText}>
                      {savingTagId === tag.id ? "Deleting..." : "Delete"}
                    </Text>
                  </Pressable>
                </View>
              </View>

              {editingTagId === tag.id ? (
                <TagForm
                  initialValues={tag}
                  isSaving={savingTagId === tag.id}
                  savingLabel="Saving..."
                  submitLabel="Save Tag"
                  onSubmit={(values) => saveExistingTag(tag.id, values)}
                />
              ) : null}
            </View>
          ))
        ) : (
          <EmptyState title="No Tags yet" body="Create Tags to label Copies by mood or purpose." />
        )}
      </View>
    </Screen>
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
  stack: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  card: {
    backgroundColor: colors.nightSoft,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.lg,
    marginTop: spacing.xl,
    padding: spacing.lg,
  },
  cardTitle: {
    ...typography.subheading,
    color: colors.cream,
  },
  tagHeader: {
    gap: spacing.md,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  secondaryButton: {
    backgroundColor: colors.nightRaised,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  secondaryButtonText: {
    ...typography.caption,
    color: colors.cream,
  },
  deleteButton: {
    backgroundColor: "rgba(158, 95, 69, 0.14)",
    borderColor: "rgba(158, 95, 69, 0.44)",
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  deleteButtonText: {
    ...typography.caption,
    color: colors.cream,
  },
});
