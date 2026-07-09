import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text } from "react-native";

import { AppHeader } from "@/components/AppHeader";
import { Screen } from "@/components/Screen";
import { createCustomCopy, listCrates, listTags } from "@/db/repositories";
import { colors, spacing, typography } from "@/design/tokens";
import { CopyForm, type CopyFormValues } from "@/features/app-shell/components/CopyForm";
import { useAsyncData } from "@/hooks/useAsyncData";

export function AddCopyScreen() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setRefreshKey((current) => current + 1);
    }, []),
  );

  const { data, error, isLoading } = useAsyncData(async () => {
    const [crates, tags] = await Promise.all([listCrates(), listTags()]);

    return { crates, tags };
  }, [refreshKey]);

  async function saveCopy(values: CopyFormValues) {
    setIsSaving(true);

    try {
      const copyId = await createCustomCopy(values);

      router.replace({
        pathname: "/copy/[id]",
        params: { id: copyId },
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Screen>
      <AppHeader title="Add Copy" subtitle="Create a local custom Copy" showBack />
      <Text style={styles.title}>Add the record in your hand.</Text>
      <Text style={styles.body}>
        Start with the essentials. Discogs, sync, and artwork upload can come later.
      </Text>
      <CopyForm
        crates={data?.crates ?? []}
        tags={data?.tags ?? []}
        isSaving={isSaving}
        optionsError={error}
        optionsLoading={isLoading}
        savingLabel="Saving..."
        showInitialJournalNote
        submitLabel="Save Copy"
        onSubmit={saveCopy}
      />
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
});
