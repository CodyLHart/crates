import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

import { AppHeader } from "@/components/AppHeader";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import {
  getJournalEntry,
  listCopies,
  softDeleteJournalEntry,
  updateJournalEntry,
  type SaveJournalEntryInput,
} from "@/db/repositories";
import { useAsyncData } from "@/hooks/useAsyncData";

import { JournalEntryForm } from "../components/JournalEntryForm";

type EditJournalEntryScreenProps = {
  journalEntryId: string;
  returnCopyId?: string;
};

export function EditJournalEntryScreen({
  journalEntryId,
  returnCopyId,
}: EditJournalEntryScreenProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { data, error, isLoading } = useAsyncData(
    () => Promise.all([getJournalEntry(journalEntryId), listCopies()] as const),
    [journalEntryId],
  );

  const entry = data?.[0];
  const copies = data?.[1] ?? [];

  async function save(values: SaveJournalEntryInput) {
    setIsSaving(true);

    try {
      await updateJournalEntry(journalEntryId, values);
      navigateAfterSave(values.copyId);
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteEntry() {
    return new Promise<void>((resolve, reject) => {
      Alert.alert("Delete Journal entry?", "This removes it from normal Journal views.", [
        { text: "Cancel", style: "cancel", onPress: () => resolve() },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setIsDeleting(true);
            softDeleteJournalEntry(journalEntryId)
              .then(() => {
                if (returnCopyId) {
                  router.replace({ pathname: "/copy/[id]", params: { id: returnCopyId } });
                } else {
                  router.replace("/(tabs)/journal");
                }

                resolve();
              })
              .catch(reject)
              .finally(() => setIsDeleting(false));
          },
        },
      ]);
    });
  }

  if (isLoading) {
    return (
      <Screen>
        <AppHeader title="Edit Journal Entry" subtitle="Loading from local SQLite" showBack />
        <EmptyState title="Loading Entry" body="Opening this Journal entry from SQLite." />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <AppHeader title="Edit Journal Entry" subtitle="Local database error" showBack />
        <EmptyState title="Journal entry unavailable" body={error.message} />
      </Screen>
    );
  }

  if (!entry) {
    return (
      <Screen>
        <AppHeader title="Edit Journal Entry" subtitle="No local entry found" showBack />
        <EmptyState title="Journal entry not found" body="Return to Journal and choose an entry." />
      </Screen>
    );
  }

  return (
    <Screen>
      <AppHeader title="Edit Journal Entry" subtitle="Update this Copy moment" showBack />
      <JournalEntryForm
        copies={copies}
        deleteAction={{
          label: "Delete Entry",
          isDeleting,
          onDelete: deleteEntry,
        }}
        initialValues={{
          copyId: entry.copyId,
          type: entry.type,
          title: entry.title,
          body: entry.body,
          occurredAt: entry.occurredAt,
        }}
        isSaving={isSaving}
        savingLabel="Saving..."
        submitLabel="Save Changes"
        onSubmit={save}
      />
    </Screen>
  );

  function navigateAfterSave(copyId: string) {
    if (returnCopyId) {
      router.replace({ pathname: "/copy/[id]", params: { id: copyId } });
      return;
    }

    router.replace("/(tabs)/journal");
  }
}
