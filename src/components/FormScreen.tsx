import { KeyboardAwareScrollView, KeyboardToolbar } from "react-native-keyboard-controller";
import { StatusBar } from "expo-status-bar";
import type { ReactNode } from "react";
import { Keyboard, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, spacing } from "@/design/tokens";

type FormScreenProps = {
  children: ReactNode;
};

const keyboardToolbarHeight = 44;

const keyboardToolbarTheme = {
  light: {
    primary: colors.night,
    disabled: colors.inkMuted,
    background: colors.cream,
    ripple: colors.borderStrong,
  },
  dark: {
    primary: colors.ember,
    disabled: colors.inkMuted,
    background: colors.nightSoft,
    ripple: colors.borderStrong,
  },
};

export function FormScreen({ children }: FormScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <KeyboardAwareScrollView
        bottomOffset={keyboardToolbarHeight + insets.bottom + spacing.lg}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: spacing.xxxl + insets.bottom,
          },
        ]}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        testID="keyboard-aware-form-scroll"
      >
        {children}
      </KeyboardAwareScrollView>
      <KeyboardToolbar
        doneText="Done"
        insets={{ left: insets.left, right: insets.right }}
        theme={keyboardToolbarTheme}
        onDoneCallback={() => Keyboard.dismiss()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.night,
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
  },
});
