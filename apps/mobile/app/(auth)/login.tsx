import {Image, StyleSheet, View, type ImageStyle} from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import {Link} from 'expo-router';
import {Button, Card, Divider, Surface} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ThemedText} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants';
import {useSignIn} from '@/features/auth';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils';

const microsoftLogo = require('../../assets/icons/microsoft.png') as number;

const iconStyle = (size: number): ImageStyle => ({width: size, height: size});

export default function LoginScreen() {
  const {ds, theme, scheme} = useTheme();
  const styles = createStyles(ds, theme);

  const {
    handleSubmit,
    handleAppleSubmit,
    isLoading,
    isStartingMobileFlow,
    isStartingAppleFlow,
    isAppleSupported,
  } = useSignIn();

  const isOidcSigningIn = isLoading || isStartingMobileFlow;
  const isAppleSigningIn = isLoading || isStartingAppleFlow;

  const commonButtonProps = {
    onPress: handleSubmit,
    disabled: isOidcSigningIn,
    loading: isOidcSigningIn,
    buttonColor: scheme === 'dark' ? '#fff' : '#000',
    textColor: scheme === 'dark' ? '#000' : '#fff',
    labelStyle: styles.buttonLabel,
    style: styles.button,
  };

  const appleButtonStyle =
    scheme === 'dark'
      ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
      : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK;

  return (
    <SafeAreaView style={styles.safe}>
      <Surface style={styles.surface} elevation={0}>
        <Card.Title
          title="S Y K A M O R E"
          titleVariant="headlineMedium"
          titleStyle={styles.title}
        />

        <Card.Content style={styles.content}>
          <Button
            mode="contained"
            {...commonButtonProps}
            icon={({size}) => (
              <Image source={microsoftLogo} style={iconStyle(size)} />
            )}
          >
            Sign in with Microsoft
          </Button>

          {isAppleSupported && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={
                AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
              }
              buttonStyle={appleButtonStyle}
              cornerRadius={16}
              onPress={handleAppleSubmit}
              style={[styles.button, isAppleSigningIn && styles.disabled]}
            />
          )}

          <View style={styles.orRow}>
            <Divider style={styles.divider} />
            <ThemedText variant="caption">OR</ThemedText>
            <Divider style={styles.divider} />
          </View>

          <Button mode="contained" {...commonButtonProps}>
            Continue with Email
          </Button>

          <View style={styles.footer}>
            <ThemedText variant="subheadline" style={styles.footerText}>
              {'By continuing, you acknowledge Sykamore\u2019s'}
            </ThemedText>
            <Link
              href="/settings/privacy"
              style={{textDecorationLine: 'underline'}}
            >
              <ThemedText variant="caption">Privacy Policy</ThemedText>
            </Link>
          </View>
        </Card.Content>
      </Surface>
    </SafeAreaView>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      safe: {
        flex: 1,
        backgroundColor: theme.background,
      },
      surface: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: theme.background,
      },
      title: {
        textAlign: 'center',
        paddingBottom: ds.layout.headerHeightLarge * 1.5,
        fontWeight: ds.fontWeight.semibold,
      },
      content: {gap: ds.spacing.lg},
      buttonLabel: {
        fontSize: 17,
        fontWeight: ds.fontWeight.semibold,
        paddingVertical: ds.spacing.xs,
      },
      button: {
        height: ds.components.button.height,
        borderRadius: 16,
      },
      disabled: {opacity: 0.8},
      orRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: ds.spacing.sm,
      },
      divider: {
        flex: 1,
        backgroundColor: theme.divider,
      },
      footer: {
        alignItems: 'center',
        gap: ds.spacing.xs,
      },
      footerText: {
        color: theme.muted,
        textAlign: 'center',
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
