import React from 'react';
import {StyleSheet, View, Image, ScrollView, KeyboardAvoidingView, Platform} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ThemedView, ThemedText, ThemedButton} from '@/components/ui';
import {Palette, type ColorScheme} from '@/constants/colors';
import {useTheme, useAuth} from '@/providers';

export default function LoginScreen() {
  const {ds, theme, scheme} = useTheme();
  const {login} = useAuth();

  const handleLogin = async () => {
    login();
  };

  const handleMicrosoftLogin = async () => {
    login();
  };

  const microsoftLogo = require('../assets/icons/microsoft.png');

  const styles = createStyles(ds, theme, scheme);

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.background}]}>
      <ThemedView style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentInsetAdjustmentBehavior="automatic">
            <View style={[styles.centered, styles.spacingXl]}>
              <ThemedText variant="title2" style={styles.centered}>
                Login
              </ThemedText>
            </View>

            <View style={[styles.spacingXl, styles.actionsStack]}>
              <ThemedButton
                variant="secondary"
                fullWidth
                onPress={handleMicrosoftLogin}
                style={[styles.thickButton, styles.microsoftButton]}>
                <Image source={microsoftLogo} style={styles.microsoftIcon} />
                <ThemedText variant="callout" style={styles.microsoftButtonText}>
                  Continue with Microsoft
                </ThemedText>
              </ThemedButton>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <ThemedText variant="caption1" colorToken="muted">
                  OR
                </ThemedText>
                <View style={styles.dividerLine} />
              </View>

              <ThemedButton
                variant="primary"
                fullWidth
                onPress={handleLogin}
                style={[styles.thickButton, styles.continueButton]}>
                <ThemedText variant="callout">Use personal email</ThemedText>
              </ThemedButton>

              <View style={styles.footer}>
                <ThemedText variant="subheadline" colorToken="muted" style={styles.footerDisclaimer}>
                  By continuing, you acknowledge Vohrad's
                </ThemedText>
                <ThemedText
                  variant="subheadline"
                  colorToken="muted"
                  style={[styles.footerDisclaimer, styles.link]}
                  accessibilityRole="link">
                  Privacy Policy
                </ThemedText>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ThemedView>
    </SafeAreaView>
  );
}

const createStyles = (ds: any, theme: any, scheme: ColorScheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: ds.layout.screenPadding,
    },
    centered: {
      alignItems: 'center',
      textAlign: 'center',
    },
    spacingXl: {
      marginBottom: ds.spacing.xl,
    },
    actionsStack: {
      gap: ds.spacing.md,
    },
    footer: {
      alignItems: 'center',
      gap: ds.spacing.xs,
    },
    thickButton: {
      paddingVertical: ds.components.button.paddingVertical + 2,
      minHeight: ds.components.button.height + 6,
    },
    microsoftButton: {
      backgroundColor: scheme === 'dark' ? Palette.creme : Palette.darkBackground,
      borderColor: scheme === 'dark' ? Palette.creme : Palette.darkBackground,
      borderWidth: 2,
    },
    microsoftButtonText: {
      color: scheme === 'dark' ? Palette.black : Palette.creme,
    },
    continueButton: {
      borderWidth: 2,
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: ds.spacing.sm,
    },
    dividerLine: {
      flex: 1,
      height: ds.components.separator.height,
      backgroundColor: theme.divider,
    },
    footerDisclaimer: {
      textAlign: 'center',
    },
    link: {
      textDecorationLine: 'underline',
    },
    microsoftIcon: {
      width: ds.iconSize.md,
      height: ds.iconSize.md,
      marginRight: ds.spacing.sm,
    },
  });
