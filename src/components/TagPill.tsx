import { StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing, typography } from "@/design/tokens";

type TagPillProps = {
  label: string;
  color?: string;
  tone?: "default" | "warm";
};

export function TagPill({ label, color, tone = "default" }: TagPillProps) {
  return (
    <View
      style={[
        styles.pill,
        tone === "warm" && styles.warm,
        color
          ? {
              backgroundColor: `${color}24`,
              borderColor: `${color}66`,
            }
          : null,
      ]}
    >
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: "flex-start",
    borderColor: colors.border,
    borderRadius: radii.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  warm: {
    backgroundColor: "rgba(210, 154, 90, 0.14)",
    borderColor: "rgba(210, 154, 90, 0.38)",
  },
  label: {
    ...typography.caption,
    color: colors.creamMuted,
  },
});
