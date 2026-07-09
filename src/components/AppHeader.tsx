import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing, typography } from "@/design/tokens";

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
};

export function AppHeader({ title, subtitle, showBack = false }: AppHeaderProps) {
  const router = useRouter();

  function goBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)/collection");
  }

  return (
    <View style={styles.header}>
      {showBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={goBack}
          style={styles.backButton}
        >
          <Ionicons color={colors.cream} name="chevron-back" size={22} />
        </Pressable>
      ) : null}
      <View style={styles.titleGroup}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.xl,
    minHeight: 44,
  },
  backButton: {
    alignItems: "center",
    backgroundColor: colors.nightSoft,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  titleGroup: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...typography.subheading,
    color: colors.cream,
  },
  subtitle: {
    ...typography.caption,
    color: colors.inkMuted,
  },
});
