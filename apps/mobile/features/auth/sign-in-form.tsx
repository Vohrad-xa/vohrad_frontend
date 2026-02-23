import React, {useCallback, useEffect, useRef, useState} from 'react';
import type {TextInput as RNTextInput} from 'react-native';
import {Alert, Platform, StyleSheet, View} from 'react-native';
import {Button, HelperText, TextInput} from 'react-native-paper';
import {themeKey, type DSShape, type ThemeShape} from '@/constants';
import * as biometricService from '@/features/security/biometric-service';
import {useAuth, useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils';
import * as AppStorage from '@/utils/storage';
import {useOidcFlow} from './use-oidc-flow';

const PASSKEY_PROMPT_KEY_PREFIX = 'passkey_prompted_v3';

export function SignInForm() {
  const [subdomain, setSubdomain] = useState('');
  const [isStartingMobileFlow, setIsStartingMobileFlow] = useState(false);
  const {startWebLogin, isLoading} = useAuth();
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);
  const {startFlow, isConfigured: isOidcConfigured} = useOidcFlow();
  const subdomainInputRef = useRef<RNTextInput>(null);

  useEffect(() => {
    AppStorage.getTenantSubdomain().then((saved) => {
      const timer = setTimeout(() => {
        if (saved) setSubdomain(saved);
        subdomainInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    });
  }, []);

  const isFormValid = subdomain.trim().length > 0;

  const promptBiometricEnableIfNeeded = useCallback(async () => {
    const shouldPrompt = await biometricService.shouldPromptEnable();
    if (!shouldPrompt) return;

    const onDecline = () => {
      biometricService.recordDecline().catch(() => {});
    };

    const onEnable = async () => {
      const result = await biometricService.enableWithAuthentication();
      if (result.success || result.cancelled) return;

      const message =
        result.error === 'LOCKED'
          ? 'Face ID is temporarily locked. Unlock your device with the passcode, then try again.'
          : result.error === 'NOT_ENROLLED'
            ? 'Face ID or Touch ID is not set up on this device. Enable it in Settings to proceed.'
            : 'Face ID could not be enabled. Check your device settings and try again.';

      Alert.alert('Unable to Enable Face ID', message);
    };

    Alert.alert(
      'Use Face ID?',
      'Secure your account with Face ID or Touch ID for instant sign-in.',
      [
        {text: 'Not now', style: 'cancel', onPress: onDecline},
        {text: 'Enable', onPress: () => void onEnable()},
      ],
    );
  }, []);

  const resolvePasskeySetupChoice = useCallback(
    async (tenantSubdomain: string) => {
      const promptKey = `${PASSKEY_PROMPT_KEY_PREFIX}:${Platform.OS}:${tenantSubdomain}`;
      const alreadyPrompted = await AppStorage.getItem(promptKey);

      if (alreadyPrompted === '1') {
        return false;
      }

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const setupPasskey = window.confirm(
          'Set up passkey during this sign-in for faster future logins?',
        );
        if (setupPasskey) {
          await AppStorage.setItem(promptKey, '1');
        }
        return setupPasskey;
      }

      const setupPasskey = await new Promise<boolean>((resolve) => {
        let resolved = false;
        const finish = (value: boolean) => {
          if (resolved) return;
          resolved = true;
          resolve(value);
        };

        Alert.alert(
          'Set up passkey?',
          'Set up passkey during this sign-in for faster future logins.',
          [
            {
              text: 'Not now',
              style: 'cancel',
              onPress: () => finish(false),
            },
            {
              text: 'Set up now',
              onPress: () => finish(true),
            },
          ],
          {
            cancelable: true,
            onDismiss: () => finish(false),
          },
        );
      });

      if (setupPasskey) {
        await AppStorage.setItem(promptKey, '1');
      }

      return setupPasskey;
    },
    [],
  );

  const handleSubmit = async () => {
    if (!isFormValid || isLoading || isStartingMobileFlow) return;

    const normalizedSubdomain = subdomain.trim();

    try {
      await AppStorage.setTenantSubdomain(normalizedSubdomain);

      if (Platform.OS === 'web') {
        const returnTo =
          typeof window !== 'undefined'
            ? `${window.location.pathname}${window.location.search}`
            : '/';

        const setupPasskey =
          await resolvePasskeySetupChoice(normalizedSubdomain);
        await startWebLogin(normalizedSubdomain, returnTo, {setupPasskey});
        return;
      }

      setIsStartingMobileFlow(true);

      const setupPasskey = await resolvePasskeySetupChoice(normalizedSubdomain);
      const outcome = await startFlow(normalizedSubdomain, {setupPasskey});
      if (!outcome.completed) {
        return;
      }

      await promptBiometricEnableIfNeeded();
    } catch {
      Alert.alert(
        'Sign in failed',
        'An unexpected error occurred. Please try again.',
      );
    } finally {
      setIsStartingMobileFlow(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        ref={subdomainInputRef}
        label="Subdomain"
        placeholder="e.g. mycompany"
        mode="outlined"
        value={subdomain}
        onChangeText={setSubdomain}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="go"
        onSubmitEditing={handleSubmit}
        outlineStyle={{borderRadius: ds.borderRadius.xxl}}
        activeOutlineColor={theme.text}
      />

      <HelperText type="info" visible>
        Please enter your organization&apos;s subdomain to continue.
      </HelperText>

      {Platform.OS !== 'web' && !isOidcConfigured && (
        <HelperText type="error" visible>
          Missing OIDC env settings for mobile (issuer URL and mobile client
          ID).
        </HelperText>
      )}

      <Button
        mode="contained"
        style={styles.submitButton}
        contentStyle={styles.submitButtonContent}
        onPress={handleSubmit}
        disabled={!isFormValid || isLoading || isStartingMobileFlow}
        loading={isLoading || isStartingMobileFlow}
        accessibilityLabel="Continue to sign in"
      >
        {isLoading || isStartingMobileFlow
          ? 'Opening sign in...'
          : Platform.OS === 'web'
            ? 'Continue to Sign In'
            : 'Continue in Browser'}
      </Button>
    </View>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        gap: ds.spacing.md,
        padding: ds.spacing.md,
      },

      submitButton: {
        borderRadius: ds.borderRadius.xxl,
        alignSelf: 'center',
        width: '60%',
      },

      submitButtonContent: {
        paddingVertical: ds.spacing.xs,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
