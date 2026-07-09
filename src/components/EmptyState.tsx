import { StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing, typography } from "@/design/tokens";

type EmptyStateProps = {
  title: string;
  body: string;
};

export function EmptyState({ title, body }: EmptyStateProps) {
  return (
    <View style={styles.empty}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    backgroundColor: colors.nightSoft,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  title: {
    ...typography.subheading,
    color: colors.cream,
  },
  body: {
    ...typography.body,
    color: colors.creamMuted,
  },
});
