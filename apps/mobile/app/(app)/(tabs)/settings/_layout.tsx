import {useCallback, useMemo} from 'react';
import {Platform} from 'react-native';
import {type NativeStackNavigationOptions} from '@react-navigation/native-stack';
import {router, Stack} from 'expo-router';
import {HeaderButton, ScreenLoadingWrapper} from '@/components/ui';
import {SearchProvider, useSearch} from '@/features/dashboard';
import {useTheme, useSidebar} from '@/providers';
import {getHeaderOptions} from '@/utils/navigation/header-actions';

export const unstable_settings = {
  initialRouteName: 'index',
};

interface SearchChangeEvent {
  nativeEvent: {
    text: string;
  };
}

function SettingsStack() {
  const {theme, ds} = useTheme();
  const {setSearchQuery} = useSearch();
  const {toggleSideMenu} = useSidebar();

  const handleSearchChange = useCallback(
    (event: SearchChangeEvent) => {
      setSearchQuery(event.nativeEvent.text);
    },
    [setSearchQuery],
  );

  const headerLeftMenu = useCallback(
    () => (
      <HeaderButton
        variant="menu"
        accessibilityLabel="Open menu"
        onPress={toggleSideMenu}
      />
    ),
    [toggleSideMenu],
  );

  // TODO: wire up notifications screen
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

  const searchBarOptions = useMemo(
    () =>
      ({
        placement: 'integratedButton' as const,
        hideWhenScrolling: false,
        placeholder: 'Search...',
        headerIconColor: theme.icon,
        onChangeText: handleSearchChange,
      }) satisfies NativeStackNavigationOptions['headerSearchBarOptions'],
    [handleSearchChange, theme.icon],
  );

  const stackScreenOptions = useMemo(
    () =>
      ({
        headerShown: true,
        headerShadowVisible: false,
        animation: 'ios_from_right' as const,
        headerBackButtonDisplayMode: 'minimal' as const,
        headerTransparent: Platform.OS === 'ios',
        headerTitleAlign: 'left' as const,
        headerTitleStyle: {
          fontWeight: ds.fontWeight.bold,
          color: Platform.OS !== 'ios' ? theme.headerAndroid : undefined,
        },
        headerLargeTitleStyle: {
          fontWeight: ds.fontWeight.bold,
        },
      }) satisfies NativeStackNavigationOptions,
    [ds.fontWeight.bold, theme.headerAndroid],
  );

  const indexOptions = useMemo(
    () =>
      ({
        headerTitle: 'Settings',
        headerTitleAlign: 'center' as const,
        headerLeft: headerLeftMenu,
        headerRight: headerRightNotifications,
        headerSearchBarOptions: searchBarOptions,
      }) satisfies NativeStackNavigationOptions,
    [headerLeftMenu, headerRightNotifications, searchBarOptions],
  );

  const usersIndexOptions = useMemo(
    () => ({
      headerTitle: 'Users',
      headerLargeTitle: true,
      headerSearchBarOptions: searchBarOptions,
    }),
    [searchBarOptions],
  );

  return (
    <ScreenLoadingWrapper>
      <Stack screenOptions={stackScreenOptions}>
        <Stack.Screen name="index" options={indexOptions} />
        <Stack.Screen name="profile" options={{title: 'Profile'}} />
        <Stack.Screen
          name="preferences"
          options={{title: 'Preferences', headerBackButtonMenuEnabled: false}}
        />
        <Stack.Screen name="language" options={{title: 'App Language'}} />
        <Stack.Screen name="support" options={{title: 'Report an Issue'}} />
        <Stack.Screen name="app-settings" options={{title: 'App Settings'}} />
        <Stack.Screen name="privacy" options={{title: 'Privacy Policy'}} />
        <Stack.Screen name="terms" options={{title: 'Terms of Use'}} />
        <Stack.Screen name="about" options={{title: 'About'}} />
        <Stack.Screen
          name="business-details"
          options={{title: 'Business Details'}}
        />
        <Stack.Screen name="plan" options={{title: 'Plan'}} />

        <Stack.Screen name="users/index" options={usersIndexOptions} />
        <Stack.Screen
          name="users/add-user"
          options={{
            title: 'Add User',
            presentation: 'modal',
            ...getHeaderOptions({
              left: [
                {
                  type: 'button',
                  key: 'close',
                  label: 'Close',
                  iosSymbol: 'xmark',
                  onPress: () => router.dismiss(),
                },
              ],
            }),
          }}
        />
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
