import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text } from "react-native";

import { AppHeader } from "@/components/AppHeader";
import { Screen } from "@/components/Screen";
import { createCrate, listCopies } from "@/db/repositories";
import { colors, spacing, typography } from "@/design/tokens";
import { CrateForm, type CrateFormValues } from "@/features/app-shell/components/CrateForm";
import { useAsyncData } from "@/hooks/useAsyncData";

export function NewCrateScreen() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const { data: copies = [], error, isLoading } = useAsyncData(listCopies, []);

  async function saveCrate(values: CrateFormValues) {
    setIsSaving(true);

    try {
      const crateId = await createCrate(values);
      router.replace({
        pathname: "/crate/[id]",
        params: { id: crateId },
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Screen>
      <AppHeader title="New Crate" subtitle="Gather Copies around a purpose" showBack />
      <Text style={styles.title}>Create a flexible place for listening.</Text>
      <Text style={styles.body}>
        A Crate can hold any Copies that belong together by mood, memory, set, or moment.
      </Text>
      <CrateForm
        copies={copies}
        copiesError={error}
        copiesLoading={isLoading}
        isSaving={isSaving}
        savingLabel="Saving..."
        submitLabel="Save Crate"
        onSubmit={saveCrate}
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
