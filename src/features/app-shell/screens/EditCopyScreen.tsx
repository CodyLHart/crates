import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text } from "react-native";

import { AppHeader } from "@/components/AppHeader";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import { getCopyWithRelease, listCrates, listTags, updateCopy } from "@/db/repositories";
import { colors, spacing, typography } from "@/design/tokens";
import { CopyForm, type CopyFormValues } from "@/features/app-shell/components/CopyForm";
import { useAsyncData } from "@/hooks/useAsyncData";

type EditCopyScreenProps = {
  copyId: string;
};

export function EditCopyScreen({ copyId }: EditCopyScreenProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setRefreshKey((current) => current + 1);
    }, []),
  );

  const { data, error, isLoading } = useAsyncData(async () => {
    const [copy, crates, tags] = await Promise.all([
      getCopyWithRelease(copyId),
      listCrates(),
      listTags(),
    ]);

    return { copy, crates, tags };
  }, [copyId, refreshKey]);

  async function saveCopy(values: CopyFormValues) {
    setIsSaving(true);

    try {
      await updateCopy(copyId, values);
      router.replace({
        pathname: "/copy/[id]",
        params: { id: copyId },
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <Screen>
        <AppHeader title="Edit Copy" subtitle="Loading local Copy" showBack />
        <EmptyState title="Loading Copy" body="Opening this Copy from SQLite." />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <AppHeader title="Edit Copy" subtitle="Local database error" showBack />
        <EmptyState title="Copy unavailable" body={error.message} />
      </Screen>
    );
  }

  if (!data?.copy) {
    return (
      <Screen>
        <AppHeader title="Edit Copy" subtitle="Missing local Copy" showBack />
        <EmptyState title="Copy not found" body="Return to Collection and choose a Copy to edit." />
      </Screen>
    );
  }

  const { copy } = data;

  return (
    <Screen>
      <AppHeader title="Edit Copy" subtitle={copy.release.primaryArtistName} showBack />
      <Text style={styles.title}>Correct and personalize this Copy.</Text>
      <Text style={styles.body}>
        Changes are saved locally to this physical Copy without touching Discogs or cloud sync.
      </Text>
      <CopyForm
        crates={data.crates}
        tags={data.tags}
        initialValues={{
          title: copy.titleOverride ?? copy.release.title,
          artist: copy.artistOverride ?? copy.release.primaryArtistName,
          mediaType: copy.mediaType,
          year: copy.yearOverride ?? copy.release.year,
          conditionMedia: copy.conditionMedia,
          conditionSleeve: copy.conditionSleeve,
          rating: copy.rating,
          tagIds: copy.tagIds,
          crateIds: copy.crateIds,
        }}
        isSaving={isSaving}
        savingLabel="Saving..."
        submitLabel="Save Changes"
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
