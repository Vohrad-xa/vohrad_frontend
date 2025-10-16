import React, {useEffect, useMemo, useRef, useState} from 'react';
import type {TextInput} from 'react-native';
import {Alert, StyleSheet, TouchableOpacity, View} from 'react-native';
import {ThemedButton, ThemedText, Input} from '@/components/ui';
import type {InputStatus} from '@/components/ui';
import * as biometricService from '@/modules/security/biometric-service';
import {useAuth, useTheme} from '@/providers';
import * as AppStorage from '@/utils/storage';
import {validateEmail} from '@/utils/validation';
import {FormCard} from '@/components/ui/form-card';
import {makeStyleFactory} from '@/utils/style-factory';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';

type PersonalEmailFormProps = {
  onSuccess: () => void;
  onForgotPassword?: () => void;
};

type FormState = {subdomain: string; email: string; password: string};
type FieldKey = keyof FormState;

type FieldRow = {
  key: FieldKey;
  placeholder: string;
  keyboardType?: 'default' | 'email-address';
  secureTextEntry?: boolean;
  ref?:
    | React.MutableRefObject<TextInput | null>
    | React.RefObject<TextInput | null>
    | React.Ref<TextInput>;
};

export function PersonalEmailForm({
  onSuccess,
  onForgotPassword,
}: PersonalEmailFormProps) {
  const [form, setForm] = useState<FormState>({
    subdomain: '',
    email: '',
    password: '',
  });
  const [showEmailValidation, setShowEmailValidation] = useState(false);

  const {loginUser, isLoading, error, clearError} = useAuth();
  const {ds, theme} = useTheme();

  const subdomainInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const emailValidationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const styles = createStyles(ds, theme);

  useEffect(() => {
    AppStorage.getTenantSubdomain().then((saved) => {
      const timer = setTimeout(() => {
        if (saved) {
          setForm((p) => ({...p, subdomain: saved}));
          emailInputRef.current?.focus();
        } else {
          subdomainInputRef.current?.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    });
  }, []);

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (emailValidationTimerRef.current)
      clearTimeout(emailValidationTimerRef.current);
    setShowEmailValidation(false);
    if (form.email.length > 0) {
      emailValidationTimerRef.current = setTimeout(
        () => setShowEmailValidation(true),
        800,
      );
    }
    return () => {
      if (emailValidationTimerRef.current)
        clearTimeout(emailValidationTimerRef.current);
    };
  }, [form.email]);

  const emailValidation = useMemo(
    () => validateEmail(form.email),
    [form.email],
  );

  const hasBackendError = !!error;
  const showSubdomainSuccess =
    form.subdomain.trim().length > 0 && !hasBackendError;
  const showEmailError =
    !hasBackendError && showEmailValidation && !emailValidation.isValid;
  const showEmailSuccess =
    !hasBackendError &&
    showEmailValidation &&
    emailValidation.isValid &&
    form.email.length > 0;
  const showPasswordSuccess = !hasBackendError && form.password.length > 0;

  const isFormValid =
    form.subdomain.trim().length > 0 &&
    emailValidation.isValid &&
    form.password.length > 0;

  const setField = (key: FieldKey, value: string) => {
    setForm((prev) => ({...prev, [key]: value}));
    clearError();
  };

  const handleApplySuggestion = () => {
    if (emailValidation.suggestion)
      setField('email', emailValidation.suggestion);
  };

  const handleEmailErrorPress = () => {
    Alert.alert(
      'Email Requirements',
      '• Must contain @ symbol\n• Must have valid domain (e.g., example.com).',
      [{text: 'OK'}],
    );
  };

  const promptBiometricEnable = async () => {
    const shouldPrompt = await biometricService.shouldPromptEnable();
    if (!shouldPrompt) return;
    Alert.alert(
      'Use Face ID?',
      'Secure your account with Face ID or Touch ID for instant sign-in.',
      [
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
      ],
    );
  };

  const handleLogin = async () => {
    if (!isFormValid) return;
    try {
      clearError();
      await loginUser(form.email.trim(), form.password, form.subdomain.trim());
      setField('password', '');
      await AppStorage.setTenantSubdomain(form.subdomain.trim());
      await promptBiometricEnable();
      onSuccess();
    } catch {}
  };

  const handleForgotPassword = () => onForgotPassword?.();

  const fields: FieldRow[] = [
    {
      key: 'subdomain',
      placeholder: 'Subdomain (e.g., mycompany)',
      keyboardType: 'default',
      ref: subdomainInputRef,
    },
    {
      key: 'email',
      placeholder: 'Email',
      keyboardType: 'email-address',
      ref: emailInputRef,
    },
    {key: 'password', placeholder: 'Password', secureTextEntry: true},
  ];

  const statusFor = (key: FieldKey): InputStatus => {
    if (key === 'email') {
      if (hasBackendError || showEmailError) return 'error';
      if (showEmailSuccess) return 'success';
      return 'none';
    }
    if (key === 'subdomain') return showSubdomainSuccess ? 'success' : 'none';
    if (key === 'password') return showPasswordSuccess ? 'success' : 'none';
    return 'none';
  };

  return (
    <View style={styles.content}>
      <FormCard<FieldRow>
        data={fields}
        keyExtractor={(it) => String(it.key)}
        renderItem={({item}) => {
          const isEmail = item.key === 'email';
          return (
            <View style={styles.fieldWrapper}>
              <Input
                ref={item.ref as any}
                placeholder={item.placeholder}
                keyboardType={item.keyboardType ?? 'default'}
                secureTextEntry={item.secureTextEntry}
                autoCapitalize="none"
                autoCorrect={false}
                value={form[item.key]}
                onChangeText={(t) => setField(item.key, t)}
                returnKeyType={item.key === 'password' ? 'go' : 'next'}
                onSubmitEditing={
                  item.key === 'password' ? handleLogin : undefined
                }
                status={statusFor(item.key)}
                onStatusIconPress={isEmail ? handleEmailErrorPress : undefined}
              />

              {isEmail && (showEmailError || emailValidation.suggestion) && (
                <View style={styles.inlineHelper}>
                  {showEmailError && (
                    <TouchableOpacity onPress={handleEmailErrorPress}>
                      <ThemedText variant="caption" colorToken="destructive">
                        {emailValidation.error ?? 'Invalid email'}
                      </ThemedText>
                    </TouchableOpacity>
                  )}
                  {emailValidation.suggestion && (
                    <TouchableOpacity onPress={handleApplySuggestion}>
                      <ThemedText variant="caption" colorToken="muted">
                        Did you mean{' '}
                        <ThemedText
                          variant="caption"
                          style={styles.suggestionEmail}
                        >
                          {emailValidation.suggestion}
                        </ThemedText>
                        ?
                      </ThemedText>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          );
        }}
      />

      {error && (
        <View style={styles.section}>
          <ThemedText
            variant="secondary"
            colorToken="destructive"
            style={styles.errorText}
          >
            {error}
          </ThemedText>
        </View>
      )}

      <View style={styles.section}>
        <TouchableOpacity onPress={handleForgotPassword} disabled={isLoading}>
          <ThemedText
            variant="secondary"
            colorToken="muted"
            style={styles.forgotPasswordLink}
          >
            Forgot password?
          </ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <ThemedButton
          variant="primary"
          title={isLoading ? 'Signing In...' : 'Sign In'}
          onPress={handleLogin}
          disabled={!isFormValid || isLoading}
          loading={isLoading}
          style={[
            styles.loginButton,
            (!isFormValid || isLoading) && styles.loginButtonDisabled,
          ]}
          accessibilityLabel="Login button"
        />
      </View>
    </View>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      content: {gap: ds.spacing.xl},
      inlineHelper: {marginTop: ds.spacing.xs, alignSelf: 'flex-start'},
      suggestionEmail: {color: theme.accentBlue, fontWeight: '500'},
      section: {gap: ds.spacing.md, alignItems: 'center', width: '100%'},
      loginButton: {paddingHorizontal: ds.spacing.xxl, alignSelf: 'center'},
      loginButtonDisabled: {opacity: ds.opacity.pressed},
      fieldWrapper: {
        width: '100%',
      },
      errorText: {
        textAlign: 'center',
      },
      forgotPasswordLink: {
        textDecorationLine: 'underline',
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);

export default PersonalEmailForm;
