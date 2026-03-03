import React from 'react';
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
import {LinearGradient} from 'expo-linear-gradient';
import {Link} from 'expo-router';
import {Button, Divider} from 'react-native-paper';
import {ThemedText} from '@/components/ui';
import {Palette, themeKey, type DSShape, type ThemeShape} from '@/constants';
import {useSignIn} from '@/features/auth';
import {useTheme} from '@/providers';
import {
  makeStyleFactory,
  AppleIcon,
  GoogleIcon,
  MicrosoftIcon,
  EmailIcon,
} from '@/utils';

type SocialButtonProps = {
  icon?: ((props: {size: number}) => React.ReactNode) | string;
  label: string;
  onPress: () => void;
  loading: boolean;
  buttonColor: string;
  textColor: string;
  labelStyle: StyleProp<TextStyle>;
  style: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
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
  contentStyle,
  outlined = false,
}: SocialButtonProps) {
  return (
    <Button
      mode={outlined ? 'outlined' : 'contained'}
      icon={icon}
      onPress={onPress}
      loading={loading}
      buttonColor={outlined ? undefined : buttonColor}
      textColor={outlined ? buttonColor : textColor}
      labelStyle={labelStyle}
      style={style}
      contentStyle={contentStyle}
    >
      {label}
    </Button>
  );
}

export default function LoginScreen() {
  const {ds, theme, scheme} = useTheme();
  const styles = createStyles(ds, theme);

  const {
    handleSubmit,
    handleAppleSubmit,
    handleGoogleSubmit,
    isStartingMobileFlow,
    isStartingGoogleFlow,
    isStartingAppleFlow,
    isAppleSupported,
    isGoogleSupported,
  } = useSignIn();

  const buttonColor = scheme === 'dark' ? Palette.white : Palette.black;
  const textColor = scheme === 'dark' ? Palette.black : Palette.white;
  const appleIconColor = textColor;

  const lightGradient = [
    '#e9f2ff',
    '#eef3fb',
    '#f2f5f9',
    '#f5f6f8',
    '#f9f7f6',
    '#fffaf6',
  ] as const;

  const darkGradient = [
    '#040509',
    '#060815',
    '#0b1020',
    '#090a12',
    '#06070b',
    '#040509',
  ] as const;

  const sharedSocialButtonProps = {
    buttonColor,
    textColor,
    labelStyle: styles.buttonLabel,
    style: styles.button,
    contentStyle: {height: ds.components.button.height},
  };

  return (
    <LinearGradient
      colors={scheme === 'dark' ? darkGradient : lightGradient}
      locations={[0, 0.2, 0.42, 0.64, 0.84, 1]}
      start={{x: 0.5, y: 0}}
      end={{x: 0.5, y: 1}}
      style={{flex: 1}}
    >
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <ThemedText variant="title3" fontWeight="medium" colorToken="icon">
              S Y K A M O R E
            </ThemedText>
            <ThemedText
              variant="title1"
              fontWeight="medium"
              style={styles.tagline}
            >
              Get it right every time
            </ThemedText>
          </View>

          <View style={styles.content}>
            {isAppleSupported && (
              <SocialButton
                icon={() => <AppleIcon color={appleIconColor} />}
                label="Continue with Apple"
                onPress={handleAppleSubmit}
                loading={isStartingAppleFlow}
                {...sharedSocialButtonProps}
              />
            )}

            {isGoogleSupported && (
              <SocialButton
                icon={() => <GoogleIcon />}
                label="Continue with Google"
                onPress={handleGoogleSubmit}
                loading={isStartingGoogleFlow}
                {...sharedSocialButtonProps}
              />
            )}

            <SocialButton
              icon={() => <MicrosoftIcon />}
              label="Continue with Microsoft"
              onPress={handleSubmit}
              loading={isStartingMobileFlow}
              {...sharedSocialButtonProps}
            />

            <View style={styles.orRow}>
              <Divider style={styles.divider} />
              <ThemedText
                variant="footnote"
                fontWeight="semibold"
                colorToken="muted"
              >
                OR
              </ThemedText>
              <Divider style={styles.divider} />
            </View>

            <SocialButton
              icon={() => <EmailIcon />}
              label="Continue with Email"
              onPress={handleSubmit}
              loading={isStartingMobileFlow}
              outlined
              {...sharedSocialButtonProps}
            />

            <View style={styles.footer}>
              <ThemedText variant="footnote" colorToken="muted">
                {'By continuing, you acknowledge Sykamore\u2019s'}
              </ThemedText>
              <Link href="/settings/privacy">
                <ThemedText variant="caption">Privacy Policy</ThemedText>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
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
        letterSpacing: 1,
      },

      content: {
        alignSelf: 'stretch',
        marginTop: 'auto',
        gap: ds.spacing.lg,
      },

      buttonLabel: {
        fontSize: ds.components.button.fontSize,
        fontWeight: ds.components.button.fontWeight,
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
        alignItems: 'center',
        gap: ds.spacing.xs,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
