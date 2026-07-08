import { StyleSheet, Text, View } from "react-native";

import { colors, spacing, typography } from "@/design/tokens";

type SectionHeaderProps = {
  title: string;
  eyebrow?: string;
};

export function SectionHeader({ title, eyebrow }: SectionHeaderProps) {
  return (
    <View style={styles.header}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
    marginBottom: spacing.md,
    marginTop: spacing.xl,
  },
  eyebrow: {
    ...typography.eyebrow,
    color: colors.ember,
    textTransform: "uppercase",
  },
  title: {
    ...typography.heading,
    color: colors.cream,
  },
});
