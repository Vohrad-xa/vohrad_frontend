import {Platform, StyleSheet} from 'react-native';
import {Stack, useRouter} from 'expo-router';
import {HeaderButton} from '@/components/ui';
import {type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {AppIcons} from '@/utils';
import {makeStyleFactory} from '@/utils/style-factory';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function SettingsLayout() {
  const {theme} = useTheme();
  const router = useRouter();
  const styles = createStyles(theme);

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTransparent: Platform.OS === 'ios',
        headerStyle:
          Platform.OS === 'android' ? styles.headerStyleAndroid : undefined,
        headerTitleStyle: styles.headerTitleStyle,
        headerTitleAlign: 'center',
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Settings',
          headerLeft:
            Platform.OS === 'ios'
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
      <Stack.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerLeft: () => (
            <HeaderButton
              icon={AppIcons.navigation.back}
              onPress={() =>
                router.canGoBack() ? router.back() : router.dismiss()
              }
              iconColorToken="text"
              accessibilityLabel="Back"
            />
          ),
        }}
      />
      <Stack.Screen name="preferences" options={{title: 'Preferences'}} />
      <Stack.Screen name="language" options={{title: 'App Language'}} />
      <Stack.Screen name="support" options={{title: 'Report an Issue'}} />
      <Stack.Screen name="organization" options={{title: 'Organization'}} />
      <Stack.Screen name="plan" options={{title: 'Plan'}} />
      <Stack.Screen name="privacy" options={{title: 'Privacy Policy'}} />
      <Stack.Screen name="terms" options={{title: 'Terms of Use'}} />
      <Stack.Screen name="about" options={{title: 'About'}} />
    </Stack>
  );
}

const createStyles = makeStyleFactory(
  (theme: ThemeShape) =>
    StyleSheet.create({
      headerStyleAndroid: {
        backgroundColor: theme.navigationBar,
      },
      headerTitleStyle: {
        color: theme.text,
      },
    }),
  (theme) => theme.version.toString(),
);
