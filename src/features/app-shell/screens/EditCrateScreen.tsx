import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text } from "react-native";

import { AppHeader } from "@/components/AppHeader";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import { getCrateWithCopies, listCopies, updateCrate } from "@/db/repositories";
import { colors, spacing, typography } from "@/design/tokens";
import { CrateForm, type CrateFormValues } from "@/features/app-shell/components/CrateForm";
import { useAsyncData } from "@/hooks/useAsyncData";

type EditCrateScreenProps = {
  crateId: string;
};

export function EditCrateScreen({ crateId }: EditCrateScreenProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const { data, error, isLoading } = useAsyncData(async () => {
    const [crateGroup, copies] = await Promise.all([getCrateWithCopies(crateId), listCopies()]);

    return { crateGroup, copies };
  }, [crateId]);

  async function saveCrate(values: CrateFormValues) {
    setIsSaving(true);

    try {
      await updateCrate(crateId, values);
      router.replace({
        pathname: "/crate/[id]",
        params: { id: crateId },
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <Screen>
        <AppHeader title="Edit Crate" subtitle="Loading local Crate" showBack />
        <EmptyState title="Loading Crate" body="Opening this Crate from SQLite." />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <AppHeader title="Edit Crate" subtitle="Local database error" showBack />
        <EmptyState title="Crate unavailable" body={error.message} />
      </Screen>
    );
  }

  if (!data?.crateGroup) {
    return (
      <Screen>
        <AppHeader title="Edit Crate" subtitle="Missing local Crate" showBack />
        <EmptyState title="Crate not found" body="Return to Crates and choose a Crate to edit." />
      </Screen>
    );
  }

  const { crate } = data.crateGroup;

  return (
    <Screen>
      <AppHeader title="Edit Crate" subtitle={crate.name} showBack />
      <Text style={styles.title}>Keep this Crate tuned to how you listen.</Text>
      <Text style={styles.body}>
        Rename it, adjust its purpose, or change which Copies belong here.
      </Text>
      <CrateForm
        copies={data.copies}
        initialValues={{
          name: crate.name,
          description: crate.description,
          coverBehavior: crate.coverBehavior,
          copyIds: crate.copyIds,
        }}
        isSaving={isSaving}
        savingLabel="Saving..."
        submitLabel="Save Changes"
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
