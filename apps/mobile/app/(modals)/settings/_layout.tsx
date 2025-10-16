import {Platform} from 'react-native';
import {Stack, useRouter} from 'expo-router';
import {useTheme} from '@/providers';
import {HeaderButton} from '@/components/ui';
import {AppIcons} from '@/utils';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function SettingsLayout() {
  const {theme} = useTheme();
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTransparent: Platform.OS === 'ios',
        headerStyle:
          Platform.OS === 'android'
            ? {backgroundColor: theme.navigationBar}
            : undefined,
        headerTitleStyle: {color: theme.text},
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
      <Stack.Screen name="profile" options={{title: 'Profile'}} />
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
