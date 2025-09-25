import React, {useEffect, useRef, useState} from 'react';
import type {TextInput} from 'react-native';
import {KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {ThemedButton, ThemedInput, ThemedText, ThemedView} from '@/components/ui';
import {type ColorScheme, Palette} from '@/constants/colors';
import {type DesignSystem} from '@/constants/typography';
import {useAuth, useTheme} from '@/providers';

type PersonalEmailFormProps = {
  onSuccess: () => void;
  onForgotPassword?: () => void;
};

export function PersonalEmailForm({onSuccess, onForgotPassword}: PersonalEmailFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const {login} = useAuth();
  const {ds, theme, scheme} = useTheme();
  const emailInputRef = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      emailInputRef.current?.focus();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleLogin = () => {
    login();
    onSuccess();
  };

  const handleForgotPassword = () => {
    if (onForgotPassword) {
      onForgotPassword();
    }
  };

  const styles = createStyles(ds, theme, scheme);

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

            <View style={styles.inputSection}>
              <ThemedInput
                ref={emailInputRef}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                accessibilityLabel="Email input"
              />
              <ThemedInput
                placeholder="Password"
                secureTextEntry
                autoComplete="password"
                textContentType="password"
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                accessibilityLabel="Password input"
              />
            </View>

            <View style={styles.section}>
              <TouchableOpacity onPress={handleForgotPassword}>
                <ThemedText variant="subheadline" colorToken="muted" style={styles.forgotPasswordText}>
                  Forgot password?
                </ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <ThemedButton
                variant="primary"
                onPress={handleLogin}
                style={styles.loginButton}
                accessibilityLabel="Login button">
                <ThemedText variant="callout" style={styles.loginButtonText}>
                  Sign In
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
      paddingBottom: ds.spacing.xxxl + ds.spacing.xxxl,
    },
    content: {
      gap: ds.spacing.xl,
    },
    section: {
      gap: ds.spacing.md,
      alignItems: 'center',
      width: '100%',
    },
    inputSection: {
      gap: ds.spacing.md,
      width: '100%',
    },
    input: {
      borderRadius: ds.borderRadius.xxxl,
      borderWidth: 0.5,
      borderColor: theme.divider,
    },
    forgotPasswordText: {
      textDecorationLine: 'underline',
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
  });

export default PersonalEmailForm;
