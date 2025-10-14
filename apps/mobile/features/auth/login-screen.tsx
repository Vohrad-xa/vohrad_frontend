import React from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {useRouter} from 'expo-router';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ThemedButton, ThemedText, ThemedView} from '@/components/ui';
import {type ColorScheme, Palette} from '@/constants/colors';
import {type DesignSystem} from '@/constants/typography';
import {usePlatformStyles} from '@/hooks';
import {useTheme} from '@/providers';

export default function LoginScreen() {
  const {ds, theme, scheme} = useTheme();
  const router = useRouter();

  const handleMicrosoftLogin = () => {
    // Until Microsoft SSO is integrated, route to email login
    router.push('/(auth)/(modals)/personal-email');
  };

  const handlePersonalEmailLogin = () => {
    router.push('/(auth)/(modals)/personal-email');
  };

  const microsoftLogo = require('../../assets/icons/microsoft.png');
  const darkModeImage = require('../../assets/images/dark_mode_image.png');

  const buttonStyles = usePlatformStyles({
    web: {
      width: '50%',
      alignSelf: 'center',
    },
    mobile: {
      width: '100%',
    },
  });

  const styles = createStyles(ds, theme, scheme);

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.background}]}
    >
      <ThemedView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentInsetAdjustmentBehavior="automatic"
          >
            <View style={[styles.centered, styles.spacingXl]}>
              <Image source={darkModeImage} style={styles.heroImage} />
              <ThemedText variant="sectionTitle" style={styles.centered}>
                Sign in
              </ThemedText>
            </View>

            <View style={[styles.spacingXl, styles.actionsStack]}>
              <ThemedButton
                fullWidth
                onPress={handleMicrosoftLogin}
                style={buttonStyles}
              >
                <Image source={microsoftLogo} style={styles.microsoftIcon} />
                <ThemedText
                  variant="body"
                  style={{
                    fontWeight: ds.fontWeight.semibold,
                    color: scheme === 'dark' ? '#000' : '#fff',
                  }}
                >
                  Continue with Microsoft
                </ThemedText>
              </ThemedButton>

              <View style={[styles.divider, buttonStyles]}>
                <View style={styles.dividerLine} />
                <ThemedText variant="secondary" colorToken="muted">
                  OR
                </ThemedText>
                <View style={styles.dividerLine} />
              </View>

              <ThemedButton
                variant="primary"
                title="Use personal email"
                fullWidth
                onPress={handlePersonalEmailLogin}
                style={[buttonStyles]}
              />

              <View style={styles.footer}>
                <ThemedText variant="caption" colorToken="muted">
                  By continuing, you acknowledge Vohrad’s
                </ThemedText>
                <ThemedText
                  variant="caption"
                  colorToken="muted"
                  style={styles.link}
                  accessibilityRole="link"
                >
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

type ThemeType = ReturnType<typeof useTheme>['theme'];
const createStyles = (
  ds: typeof DesignSystem,
  theme: ThemeType,
  scheme: ColorScheme,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      flex: 1,
      justifyContent: 'center',
      padding: ds.layout.screenPadding,
      width: '100%',
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
    link: {
      textDecorationLine: 'underline',
    },
    microsoftIcon: {
      width: ds.iconSize.md,
      height: ds.iconSize.md,
      marginRight: ds.spacing.sm,
    },
    heroImage: {
      width: 200,
      height: 200,
    },
  });
