import { useRouter } from "expo-router";
import { useState } from "react";

import { AppHeader } from "@/components/AppHeader";
import { EmptyState } from "@/components/EmptyState";
import { FormScreen } from "@/components/FormScreen";
import { createJournalEntry, listCopies, type SaveJournalEntryInput } from "@/db/repositories";
import { useAsyncData } from "@/hooks/useAsyncData";

import { JournalEntryForm } from "../components/JournalEntryForm";

type AddJournalEntryScreenProps = {
  copyId?: string;
};

export function AddJournalEntryScreen({ copyId }: AddJournalEntryScreenProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const { data: copies = [], error, isLoading } = useAsyncData(listCopies, []);

  async function save(values: SaveJournalEntryInput) {
    setIsSaving(true);

    try {
      await createJournalEntry(values);

      if (copyId) {
        router.replace({ pathname: "/copy/[id]", params: { id: copyId } });
        return;
      }

      router.replace("/(tabs)/journal");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <FormScreen>
      <AppHeader title="New Journal Entry" subtitle="Save a Copy moment locally" showBack />
      {!isLoading && !error && copies.length === 0 ? (
        <EmptyState
          title="No Copies yet"
          body="Add a Copy before creating Journal entries for your collection."
        />
      ) : (
        <JournalEntryForm
          copies={copies}
          fixedCopyId={copyId}
          isSaving={isSaving}
          optionsError={error}
          optionsLoading={isLoading}
          savingLabel="Saving..."
          submitLabel="Save Entry"
          onSubmit={save}
        />
      )}
    </FormScreen>
  );
}
