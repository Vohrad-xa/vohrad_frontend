import {Platform, StyleSheet} from 'react-native';
import {Stack, useRouter} from 'expo-router';
import {HeaderButton, ScreenLoadingWrapper} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {AppIcons, makeStyleFactory} from '@/utils';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function SettingsLayout() {
  const {theme, ds} = useTheme();
  const router = useRouter();
  const styles = createStyles(theme, ds);

  return (
    <ScreenLoadingWrapper>
      <Stack
        screenOptions={{
          headerShown: true,
          headerShadowVisible: false,
          headerTransparent: Platform.OS === 'ios',
          headerTitleAlign: 'center',
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: styles.container,
          headerStyle:
            Platform.OS === 'android'
              ? {backgroundColor: theme.navigationBar}
              : undefined,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Settings',
            headerLeft:
              Platform.OS === 'ios' || Platform.OS === 'web'
                ? undefined
                : () => (
                    <HeaderButton
                      icon={AppIcons.navigation.back}
                      onPress={() => router.dismiss()}
                      iconColorToken="text"
                      accessibilityLabel="Close settings"
                      iconSize="lg"
                    />
                  ),
            headerRight: () => (
              <HeaderButton
                icon={AppIcons.navigation.close}
                onPress={() => router.dismiss()}
                iconColorToken="text"
                accessibilityLabel="Close settings"
              />
            ),
          }}
        />
        <Stack.Screen name="profile" options={{title: 'Profile'}} />
        <Stack.Screen name="preferences" options={{title: 'Preferences'}} />
        <Stack.Screen name="language" options={{title: 'App Language'}} />
        <Stack.Screen name="support" options={{title: 'Report an Issue'}} />
        <Stack.Screen
          name="organization/index"
          options={{title: 'Organization'}}
        />
        <Stack.Screen name="privacy" options={{title: 'Privacy Policy'}} />
        <Stack.Screen name="terms" options={{title: 'Terms of Use'}} />
        <Stack.Screen name="about" options={{title: 'About'}} />
        <Stack.Screen
          name="organization/business-details"
          options={{title: 'Business Details'}}
        />
        <Stack.Screen name="organization/plan" options={{title: 'Plan'}} />
      </Stack>
    </ScreenLoadingWrapper>
  );
}

const createStyles = makeStyleFactory(
  (theme: ThemeShape, _ds: DSShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor:
          Platform.OS === 'web' ? theme.webbackground : theme.secondbackground,
      },
    }),
  (theme, ds) => themeKey(theme, ds),
);
