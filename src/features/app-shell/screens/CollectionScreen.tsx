import { StyleSheet, Text, View } from "react-native";

import { CopyRow } from "@/components/CopyRow";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { demoCopies } from "@/constants/demoData";
import { colors, spacing, typography } from "@/design/tokens";

export function CollectionScreen() {
  return (
    <Screen>
      <Text style={styles.eyebrow}>Collection</Text>
      <Text style={styles.title}>Your Copies, not just releases.</Text>
      <Text style={styles.body}>
        Local demo data shows how Crates keeps ownership details close to the artwork, condition,
        and personal context.
      </Text>

      <SectionHeader title={`${demoCopies.length} Copies`} />
      <View style={styles.stack}>
        {demoCopies.map((copy) => (
          <CopyRow key={copy.id} copy={copy} />
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
  },
});
