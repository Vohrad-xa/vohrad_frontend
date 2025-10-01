import React, {useEffect, useMemo, useRef, useState} from 'react';
import type {TextInput} from 'react-native';
import {Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {ThemedButton, ThemedInput, ThemedText, ThemedView} from '@/components/ui';
import {type ColorScheme, Palette} from '@/constants/colors';
import {type DesignSystem} from '@/constants/typography';
import * as biometricService from '@/modules/security/biometric-service';
import {useAuth, useTheme} from '@/providers';
import * as AppStorage from '@/utils/storage';
import {validateEmail} from '@/utils/validation';

type PersonalEmailFormProps = {
  onSuccess: () => void;
  onForgotPassword?: () => void;
};

export function PersonalEmailForm({onSuccess, onForgotPassword}: PersonalEmailFormProps) {
  // Form state
  const [subdomain, setSubdomain] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showEmailValidation, setShowEmailValidation] = useState(false);

  // Hooks
  const {loginUser, isLoading, error, clearError} = useAuth();
  const {ds, theme, scheme} = useTheme();

  // Refs
  const subdomainInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const emailValidationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    AppStorage.getTenantSubdomain().then((savedSubdomain) => {
      const timer = setTimeout(() => {
        if (savedSubdomain) {
          setSubdomain(savedSubdomain);
          emailInputRef.current?.focus();
        } else {
          subdomainInputRef.current?.focus();
        }
      }, 100);

      return () => clearTimeout(timer);
    });
  }, []);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Debounce email validation
  useEffect(() => {
    if (emailValidationTimerRef.current) {
      clearTimeout(emailValidationTimerRef.current);
    }

    setShowEmailValidation(false);

    if (email.length > 0) {
      emailValidationTimerRef.current = setTimeout(() => {
        setShowEmailValidation(true);
      }, 800);
    }

    return () => {
      if (emailValidationTimerRef.current) {
        clearTimeout(emailValidationTimerRef.current);
      }
    };
  }, [email]);

  const emailValidation = useMemo(() => validateEmail(email), [email]);

  // Determine input states based on backend error or frontend validation
  const hasBackendError = !!error;

  const showSubdomainSuccess = subdomain.trim().length > 0;
  const showEmailError = !hasBackendError && showEmailValidation && !emailValidation.isValid;
  const showEmailSuccess = !hasBackendError && showEmailValidation && emailValidation.isValid && email.length > 0;
  const showPasswordSuccess = !hasBackendError && password.length > 0;

  // Apply typo suggestion
  const handleApplySuggestion = () => {
    if (emailValidation.suggestion) {
      setEmail(emailValidation.suggestion);
      clearError();
    }
  };

  // Email requirements alert
  const handleEmailErrorPress = () => {
    Alert.alert('Email Requirements', '• Must contain @ symbol\n• Must have valid domain (e.g., example.com).', [
      {text: 'OK'},
    ]);
  };

  // Handle login submission
  const handleLogin = async () => {
    if (!subdomain.trim() || !email.trim() || !password) return;
    if (!emailValidation.isValid) return;

    try {
      clearError();
      await loginUser(email.trim(), password, subdomain.trim());
      setPassword('');
      await AppStorage.setTenantSubdomain(subdomain.trim());
      await promptBiometricEnable();
      onSuccess();
    } catch {
      // Backend error
    }
  };

  // Form validation state
  const isFormValid = subdomain.trim().length > 0 && emailValidation.isValid && password.length > 0;

  const handleForgotPassword = () => {
    onForgotPassword?.();
  };

  const styles = createStyles(ds, theme, scheme);

  // Offer biometric opt-in immediately after a successful login
  const promptBiometricEnable = async () => {
    const shouldPrompt = await biometricService.shouldPromptEnable();
    if (!shouldPrompt) {
      return;
    }

    Alert.alert('Use Face ID?', 'Secure your account with Face ID or Touch ID for instant sign-in.', [
      {
        text: 'Not now',
        style: 'cancel',
        onPress: () => {
          biometricService.recordDecline().catch(() => {});
        },
      },
      {
        text: 'Enable',
        onPress: () => {
          void (async () => {
            const result = await biometricService.enableWithAuthentication();
            if (!result.success && !result.cancelled) {
              const message =
                result.error === 'LOCKED'
                  ? 'Face ID is temporarily locked. Unlock your device with the passcode, then try again.'
                  : result.error === 'NOT_ENROLLED'
                    ? 'Face ID or Touch ID is not set up on this device. Enable it in Settings to proceed.'
                    : 'Face ID could not be enabled. Check your device settings and try again.';
              Alert.alert('Unable to Enable Face ID', message);
            }
          })();
        },
      },
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces
          keyboardDismissMode="interactive"
          contentInsetAdjustmentBehavior="automatic">
          <View style={styles.content}>
            <View style={styles.section}>
              <ThemedText variant="title2">Welcome Back</ThemedText>
              <ThemedText variant="subheadline" colorToken="muted">
                Sign in with your personal email
              </ThemedText>
            </View>

            <View style={styles.section}>
              <ThemedInput
                ref={subdomainInputRef}
                placeholder="Subdomain (e.g., mycompany)"
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect={false}
                value={subdomain}
                onChangeText={(text) => {
                  setSubdomain(text);
                  clearError();
                }}
                returnKeyType="next"
                style={styles.input}
                accessibilityLabel="Subdomain input"
                editable={!isLoading}
                success={showSubdomainSuccess}
              />
              <ThemedInput
                ref={emailInputRef}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  clearError();
                }}
                returnKeyType="next"
                style={styles.input}
                accessibilityLabel="Email input"
                editable={!isLoading}
                error={hasBackendError ? 'Invalid' : showEmailError ? (emailValidation.error ?? undefined) : undefined}
                success={showEmailSuccess}
                onErrorPress={handleEmailErrorPress}
              />
              {emailValidation.suggestion && (
                <TouchableOpacity
                  onPress={handleApplySuggestion}
                  style={styles.suggestion}
                  accessibilityLabel="Apply email suggestion">
                  <ThemedText variant="caption" colorToken="muted">
                    Did you mean{' '}
                    <ThemedText variant="caption" style={styles.suggestionEmail}>
                      {emailValidation.suggestion}
                    </ThemedText>
                    ?
                  </ThemedText>
                </TouchableOpacity>
              )}
              <ThemedInput
                placeholder="Password"
                secureTextEntry
                autoComplete="password"
                textContentType="password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  clearError();
                }}
                returnKeyType="go"
                onSubmitEditing={handleLogin}
                style={styles.input}
                accessibilityLabel="Password input"
                editable={!isLoading}
                error={hasBackendError ? 'Invalid' : undefined}
                success={showPasswordSuccess}
              />
            </View>

            {error && (
              <View style={styles.section}>
                <ThemedText variant="subheadline" colorToken="destructive" style={{textAlign: 'center'}}>
                  {error}
                </ThemedText>
              </View>
            )}

            <View style={styles.section}>
              <TouchableOpacity onPress={handleForgotPassword} disabled={isLoading}>
                <ThemedText variant="subheadline" colorToken="muted" style={{textDecorationLine: 'underline'}}>
                  Forgot password?
                </ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <ThemedButton
                variant="primary"
                onPress={handleLogin}
                disabled={!isFormValid || isLoading}
                style={[styles.loginButton, (!isFormValid || isLoading) && styles.loginButtonDisabled]}
                accessibilityLabel="Login button">
                <ThemedText variant="callout" style={styles.loginButtonText}>
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </ThemedText>
              </ThemedButton>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

type ThemeType = ReturnType<typeof useTheme>['theme'];
const createStyles = (ds: typeof DesignSystem, theme: ThemeType, scheme: ColorScheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: ds.layout.screenPadding,
      paddingBottom: ds.spacing.xxxl * 2,
    },
    content: {
      gap: ds.spacing.xl,
    },
    section: {
      gap: ds.spacing.md,
      alignItems: 'center',
      width: '100%',
    },
    input: {
      borderRadius: ds.borderRadius.xxxl,
      borderWidth: 0.5,
      borderColor: theme.divider,
    },
    suggestion: {
      marginTop: ds.spacing.xs,
      paddingHorizontal: ds.spacing.xs,
      alignSelf: 'flex-start',
    },
    suggestionEmail: {
      color: theme.accentBlue,
      fontWeight: '500',
    },
    loginButton: {
      paddingHorizontal: ds.spacing.xxl,
      borderRadius: ds.borderRadius.xxxl,
      alignSelf: 'center',
      ...(scheme === 'dark' && {
        backgroundColor: Palette.creme,
        borderColor: theme.border,
        borderWidth: 1,
      }),
    },
    loginButtonText: {
      ...(scheme === 'dark' && {
        color: Palette.black,
      }),
    },
    loginButtonDisabled: {
      opacity: ds.opacity.pressed,
    },
  });

export default PersonalEmailForm;
