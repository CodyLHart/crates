import { StyleSheet, Text, View } from "react-native";

import { CrateCard } from "@/components/CrateCard";
import { Screen } from "@/components/Screen";
import { crates, demoCopies } from "@/constants/demoData";
import { colors, spacing, typography } from "@/design/tokens";

export function CratesScreen() {
  return (
    <Screen>
      <Text style={styles.eyebrow}>Crates</Text>
      <Text style={styles.title}>Flexible groups for how you actually listen.</Text>
      <Text style={styles.body}>
        Copies can live in more than one Crate, so mood and purpose can overlap.
      </Text>

      <View style={styles.stack}>
        {crates.map((crate) => (
          <CrateCard
            key={crate.id}
            crate={crate}
            copies={demoCopies.filter((copy) => crate.copyIds.includes(copy.id))}
          />
        ))}
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
