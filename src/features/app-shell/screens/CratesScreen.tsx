import { Link, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppHeader } from "@/components/AppHeader";
import { CrateCard } from "@/components/CrateCard";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import { listCratesWithCopies } from "@/db/repositories";
import { colors, spacing, typography } from "@/design/tokens";
import { useAsyncData } from "@/hooks/useAsyncData";

export function CratesScreen() {
  const [refreshKey, setRefreshKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setRefreshKey((current) => current + 1);
    }, []),
  );

  const {
    data: crateGroups = [],
    error,
    isLoading,
  } = useAsyncData(listCratesWithCopies, [refreshKey]);

  return (
    <Screen>
      <AppHeader title="Crates" subtitle="Flexible groups for your Copies" />
      <Text style={styles.title}>Flexible groups for how you actually listen.</Text>
      <Text style={styles.body}>
        Copies can live in more than one Crate, so mood and purpose can overlap.
      </Text>
      <Link href="/crate/new" style={styles.addLink}>
        New Crate
      </Link>

      <View style={styles.stack}>
        {isLoading ? (
          <EmptyState title="Loading Crates" body="Reading local Crate memberships from SQLite." />
        ) : error ? (
          <EmptyState title="Crates unavailable" body={error.message} />
        ) : crateGroups.length ? (
          crateGroups.map(({ crate, copies }) => (
            <CrateCard key={crate.id} crate={crate} copies={copies} />
          ))
        ) : (
          <EmptyState
            title="No Crates yet"
            body="Crates will group Copies by mood, purpose, or memory."
          />
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
  addLink: {
    ...typography.subheading,
    alignSelf: "flex-start",
    backgroundColor: colors.ember,
    borderRadius: 8,
    color: colors.night,
    marginTop: spacing.lg,
    overflow: "hidden",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  stack: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
});
