import {Platform} from 'react-native';
import {Stack, router} from 'expo-router';
import {HeaderButton} from '@/components/ui';
import {useTheme} from '@/providers';
import {AppIcons} from '@/utils';

export default function SettingsLayout() {
  const {theme} = useTheme();

  const getScreenOptions = (title: string) => ({
    title,
    headerLeft: () => (
      <HeaderButton icon={AppIcons.navigation.back} accessibilityLabel="Back" onPress={() => router.back()} />
    ),
    headerRight: () => null,
  });

  return (
    <Stack
      screenOptions={{
        contentStyle: {backgroundColor: theme.background},
        headerShown: true,
        headerTransparent: Platform.OS === 'ios',
        headerStyle: Platform.OS === 'android' ? {backgroundColor: theme.navigationBar} : undefined,
        headerTitleStyle: {color: theme.text},
        headerTitleAlign: 'center',
      }}>
      <Stack.Screen
        name="index"
        options={{
          title: 'Settings',
          headerLeft: () => null,
          headerRight: () => (
            <HeaderButton
              icon={AppIcons.navigation.close}
              accessibilityLabel="Close"
              onPress={() => router.dismiss()}
            />
          ),
        }}
      />
      <Stack.Screen name="profile" options={getScreenOptions('Profile')} />
      <Stack.Screen name="preferences" options={getScreenOptions('Preferences')} />
      <Stack.Screen name="language" options={getScreenOptions('App Language')} />
      <Stack.Screen name="support" options={getScreenOptions('Report an Issue')} />
      <Stack.Screen name="organization" options={getScreenOptions('Organization')} />
      <Stack.Screen name="plan" options={getScreenOptions('Plan')} />
      <Stack.Screen name="privacy" options={getScreenOptions('Privacy Policy')} />
      <Stack.Screen name="terms" options={getScreenOptions('Terms of Use')} />
      <Stack.Screen name="about" options={getScreenOptions('About')} />
    </Stack>
  );
}
