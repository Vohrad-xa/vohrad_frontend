import React, {useEffect, useMemo, useRef, useState} from 'react';
import type {TextInput as RNTextInput} from 'react-native';
import {Alert, View} from 'react-native';
import {validateEmail} from '@sykamore/types';
import {Button, HelperText, TextInput} from 'react-native-paper';
import * as biometricService from '@/features/security/biometric-service';
import {useAuth, useTheme} from '@/providers';
import * as AppStorage from '@/utils/storage';

type PersonalEmailFormProps = {
  onSuccess: () => void;
  onForgotPassword?: () => void;
};

type FormState = {subdomain: string; email: string; password: string};
type FieldKey = keyof FormState;

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
  const [securePassword, setSecurePassword] = useState(true);

  const {loginUser, isLoading} = useAuth();
  const {ds, theme} = useTheme();

  const subdomainInputRef = useRef<RNTextInput>(null);
  const emailInputRef = useRef<RNTextInput>(null);
  const passwordInputRef = useRef<RNTextInput>(null);
  const emailValidationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

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

  const showEmailError = showEmailValidation && !emailValidation.isValid;

  const isFormValid =
    form.subdomain.trim().length > 0 &&
    emailValidation.isValid &&
    form.password.length > 0;

  const setField = (key: FieldKey, value: string) => {
    setForm((prev) => ({...prev, [key]: value}));
  };

  const handleApplySuggestion = () => {
    if (emailValidation.suggestion)
      setField('email', emailValidation.suggestion);
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
      await loginUser(form.email.trim(), form.password, form.subdomain.trim());
      setField('password', '');
      await AppStorage.setTenantSubdomain(form.subdomain.trim());
      await promptBiometricEnable();
      onSuccess();
    } catch {}
  };

  const handleForgotPassword = () => onForgotPassword?.();

  return (
    <View style={{gap: 16, padding: 16}}>
      <TextInput
        ref={subdomainInputRef}
        label="Subdomain"
        placeholder="e.g. mycompany"
        mode="outlined"
        value={form.subdomain}
        onChangeText={(t) => setField('subdomain', t)}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="next"
        onSubmitEditing={() => emailInputRef.current?.focus()}
        outlineStyle={{borderRadius: ds.borderRadius.xxl}}
        activeOutlineColor={theme.text}
      />

      <View>
        <TextInput
          ref={emailInputRef}
          label="Email"
          placeholder="you@example.com"
          mode="outlined"
          value={form.email}
          onChangeText={(t) => setField('email', t)}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
          onSubmitEditing={() => passwordInputRef.current?.focus()}
          error={showEmailError}
          outlineStyle={{borderRadius: ds.borderRadius.xxl}}
          activeOutlineColor={theme.text}
        />
        {showEmailError && !emailValidation.suggestion && (
          <HelperText type="error" visible>
            {emailValidation.error ?? 'Invalid email'}
          </HelperText>
        )}
        {emailValidation.suggestion && showEmailValidation && (
          <HelperText type="info" visible onPress={handleApplySuggestion}>
            Did you mean {emailValidation.suggestion}?
          </HelperText>
        )}
      </View>

      <TextInput
        ref={passwordInputRef}
        label="Password"
        mode="outlined"
        value={form.password}
        onChangeText={(t) => setField('password', t)}
        secureTextEntry={securePassword}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="go"
        onSubmitEditing={handleLogin}
        right={
          <TextInput.Icon
            icon={securePassword ? 'eye-off' : 'eye'}
            onPress={() => setSecurePassword((v) => !v)}
            forceTextInputFocus={false}
          />
        }
        outlineStyle={{borderRadius: ds.borderRadius.xxl}}
        activeOutlineColor={theme.text}
      />

      <Button
        mode="text"
        onPress={handleForgotPassword}
        disabled={isLoading}
        textColor={theme.accentBlue}
      >
        Forgot password?
      </Button>

      <Button
        mode="contained"
        style={{
          padding: ds.spacing.xs,
          borderRadius: ds.borderRadius.xxl,
          width: ds.screen.width * 0.5,
          alignSelf: 'center',
        }}
        onPress={handleLogin}
        disabled={!isFormValid || isLoading}
        loading={isLoading}
        accessibilityLabel="Login button"
      >
        {isLoading ? 'Signing In...' : 'Sign In'}
      </Button>
    </View>
  );
}

export default PersonalEmailForm;
