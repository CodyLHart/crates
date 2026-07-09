import { StyleSheet, Text, View } from "react-native";

import { CrateCard } from "@/components/CrateCard";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import { listCratesWithCopies } from "@/db/repositories";
import { colors, spacing, typography } from "@/design/tokens";
import { useAsyncData } from "@/hooks/useAsyncData";

export function CratesScreen() {
  const { data: crateGroups = [], error, isLoading } = useAsyncData(listCratesWithCopies, []);

  return (
    <Screen>
      <Text style={styles.eyebrow}>Crates</Text>
      <Text style={styles.title}>Flexible groups for how you actually listen.</Text>
      <Text style={styles.body}>
        Copies can live in more than one Crate, so mood and purpose can overlap.
      </Text>

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
  eyebrow: {
    ...typography.eyebrow,
    color: colors.ember,
    textTransform: "uppercase",
  },
  title: {
    ...typography.title,
    color: colors.cream,
    marginTop: spacing.sm,
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
});
