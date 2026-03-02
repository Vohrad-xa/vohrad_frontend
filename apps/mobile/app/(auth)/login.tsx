import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type TextStyle,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import {Link} from 'expo-router';
import {Button, Divider} from 'react-native-paper';
import {ThemedText} from '@/components/ui';
import {Palette, themeKey, type DSShape, type ThemeShape} from '@/constants';
import {useSignIn} from '@/features/auth';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils';

type SocialButtonProps = {
  icon?: string;
  label: string;
  onPress: () => void;
  loading: boolean;
  buttonColor: string;
  textColor: string;
  labelStyle: StyleProp<TextStyle>;
  style: StyleProp<ViewStyle>;
  outlined?: boolean;
};

function SocialButton({
  icon,
  label,
  onPress,
  loading,
  buttonColor,
  textColor,
  labelStyle,
  style,
  outlined = false,
}: SocialButtonProps) {
  return (
    <Button
      mode={outlined ? 'outlined' : 'contained'}
      icon={icon}
      onPress={onPress}
      loading={loading}
      buttonColor={outlined ? textColor : buttonColor}
      textColor={outlined ? buttonColor : textColor}
      labelStyle={labelStyle}
      style={style}
    >
      {label}
    </Button>
  );
}

export default function LoginScreen() {
  const {ds, theme, scheme} = useTheme();
  const styles = createStyles(ds, theme, scheme);

  const {
    handleSubmit,
    handleAppleSubmit,
    handleGoogleSubmit,
    isStartingMobileFlow,
    isStartingGoogleFlow,
    isAppleSupported,
    isGoogleSupported,
  } = useSignIn();

  const buttonColor = scheme === 'dark' ? Palette.white : Palette.black;
  const textColor = scheme === 'dark' ? Palette.black : Palette.white;

  // const isMicrosoftSigningIn = isStartingMobileFlow;
  const isGoogleSigningIn = isStartingGoogleFlow;
  const isEmailSigningIn = isStartingMobileFlow;

  const sharedSocialButtonProps = {
    buttonColor,
    textColor,
    labelStyle: styles.buttonLabel,
    style: styles.button,
  };

  const appleButtonStyle =
    scheme === 'dark'
      ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
      : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText variant="title2" fontWeight="semibold" colorToken="icon">
            S Y K A M O R E
          </ThemedText>
          <ThemedText
            variant="largeTitle"
            fontWeight="semibold"
            style={styles.tagline}
          >
            Everything in its place.
          </ThemedText>
        </View>

        <View style={styles.content}>
          {/* <SocialButton
            icon="microsoft"
            label="Sign in with Microsoft"
            onPress={handleSubmit}
            loading={isMicrosoftSigningIn}
            {...sharedSocialButtonProps}
          /> */}

          {isGoogleSupported && (
            <SocialButton
              icon="google"
              label="Sign in with Google"
              onPress={handleGoogleSubmit}
              loading={isGoogleSigningIn}
              {...sharedSocialButtonProps}
            />
          )}

          {isAppleSupported && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={
                AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
              }
              buttonStyle={appleButtonStyle}
              cornerRadius={ds.components.button.borderRadius}
              onPress={handleAppleSubmit}
              style={styles.button}
            />
          )}

          <View style={styles.orRow}>
            <Divider style={styles.divider} />
            <ThemedText variant="caption">OR</ThemedText>
            <Divider style={styles.divider} />
          </View>

          <SocialButton
            label="Continue with Email"
            onPress={handleSubmit}
            loading={isEmailSigningIn}
            outlined
            {...sharedSocialButtonProps}
          />
        </View>

        <View style={styles.footer}>
          <ThemedText variant="footnote" colorToken="muted">
            {'By continuing, you acknowledge Sykamore\u2019s'}
          </ThemedText>
          <Link href="/settings/privacy" style={styles.footerLink}>
            <ThemedText variant="caption">Privacy Policy</ThemedText>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape, scheme: 'light' | 'dark') =>
    StyleSheet.create({
      root: {
        flex: 1,
        backgroundColor: scheme === 'dark' ? Palette.black : Palette.offWhite,
      },
      scroll: {
        flexGrow: 1,
        alignItems: 'center',
        paddingHorizontal: ds.layout.screenPadding * 1.5,
        paddingTop: ds.screen.height * 0.25,
        paddingBottom: ds.screen.height * 0.15,
      },
      header: {
        alignItems: 'center',
        gap: ds.spacing.xl,
      },
      tagline: {
        textAlign: 'center',
        lineHeight: ds.layout.headerHeight,
        letterSpacing: 1.3,
      },
      content: {
        alignSelf: 'stretch',
        marginTop: 'auto',
        gap: ds.spacing.lg,
      },
      buttonLabel: {
        fontSize: ds.components.button.fontSize,
        fontWeight: ds.fontWeight.semibold,
        paddingVertical: ds.spacing.xs,
      },
      button: {
        height: ds.components.button.height,
        borderRadius: ds.components.button.borderRadius,
      },
      orRow: {
        alignSelf: 'stretch',
        flexDirection: 'row',
        alignItems: 'center',
        gap: ds.spacing.sm,
      },
      divider: {
        flex: 1,
        backgroundColor: theme.divider,
      },
      footer: {
        marginTop: ds.spacing.lg,
        gap: ds.spacing.xs,
      },
      footerLink: {
        alignSelf: 'center',
      },
    }),
  (ds, theme, _scheme) => themeKey(theme, ds),
);
