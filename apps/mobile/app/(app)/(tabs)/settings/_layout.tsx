import {useCallback, useMemo} from 'react';
import {Platform} from 'react-native';
import {type NativeStackNavigationOptions} from '@react-navigation/native-stack';
import {Stack} from 'expo-router';
import {HeaderButton, ScreenLoadingWrapper} from '@/components/ui';
import {SearchProvider} from '@/features/dashboard';
import {useTheme} from '@/providers';

export const unstable_settings = {
  initialRouteName: 'index',
};

function SettingsStack() {
  const {theme} = useTheme();

  const headerRightNotifications = useCallback(
    () => (
      <HeaderButton
        variant="more"
        accessibilityLabel="Open events"
        onPress={undefined}
      />
    ),
    [],
  );

  const stackScreenOptions = useMemo(
    () =>
      ({
        headerShown: true,
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal' as const,
        headerTransparent: Platform.OS === 'ios',
        headerTitleStyle: {
          color: Platform.OS !== 'ios' ? theme.headerAndroid : undefined,
          fontSize: Platform.OS !== 'ios' ? 26 : undefined,
        },
      }) satisfies NativeStackNavigationOptions,
    [theme.headerAndroid],
  );

  const indexOptions = useMemo(
    () =>
      ({
        headerTitle: 'Settings',
        headerRight: headerRightNotifications,
      }) satisfies NativeStackNavigationOptions,
    [headerRightNotifications],
  );

  return (
    <ScreenLoadingWrapper>
      <Stack screenOptions={stackScreenOptions}>
        <Stack.Screen name="index" options={indexOptions} />
        <Stack.Screen name="language" options={{title: 'App Language'}} />
        <Stack.Screen name="support" options={{title: 'Report an Issue'}} />
        <Stack.Screen name="app-settings" options={{title: 'App Settings'}} />
        <Stack.Screen name="privacy" options={{title: 'Privacy Policy'}} />
        <Stack.Screen name="terms" options={{title: 'Terms of Use'}} />
        <Stack.Screen name="about" options={{title: 'About'}} />

        <Stack.Screen
          name="profile"
          options={{headerShown: Platform.OS === 'ios'}}
        />
        <Stack.Screen name="tenant" options={{headerShown: false}} />
      </Stack>
    </ScreenLoadingWrapper>
  );
}

export default function SettingsLayout() {
  return (
    <SearchProvider>
      <SettingsStack />
    </SearchProvider>
  );
}
