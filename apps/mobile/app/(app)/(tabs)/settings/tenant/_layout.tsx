import {useMemo, useCallback} from 'react';
import {Platform} from 'react-native';
import {type NativeStackNavigationOptions} from '@react-navigation/native-stack';
import {Stack, router} from 'expo-router';
import {useSearch} from '@/features/dashboard';
import {useTheme} from '@/providers';
import {getHeaderOptions} from '@/utils/navigation/header-actions';

export const unstable_settings = {
  initialRouteName: 'index',
};

interface SearchChangeEvent {
  nativeEvent: {
    text: string;
  };
}

export default function OrganizationLayout() {
  const {theme, ds} = useTheme();

  const {setSearchQuery} = useSearch();

  const handleSearchChange = useCallback(
    (event: SearchChangeEvent) => {
      setSearchQuery(event.nativeEvent.text);
    },
    [setSearchQuery],
  );

  const screenOptions = useMemo(
    () => ({
      headerShown: true,
      headerShadowVisible: false,
      headerBackButtonDisplayMode: 'minimal' as const,
      headerTransparent: Platform.OS === 'ios',
      headerTitleStyle: {
        fontSize: Platform.OS !== 'ios' ? 26 : undefined,
        color: Platform.OS !== 'ios' ? theme.headerAndroid : undefined,
      },
      headerLargeTitleStyle: {
        fontWeight: ds.fontWeight.bold,
      },
    }),
    [ds.fontWeight.bold, theme.headerAndroid],
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

  const usersIndexOptions = useMemo(
    () => ({
      headerTitle: 'Users',
      headerLargeTitle: true,
      headerSearchBarOptions: searchBarOptions,
    }),
    [searchBarOptions],
  );

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="index" options={{title: 'Tenant'}} />
      <Stack.Screen name="tenant-info" options={{title: 'Details'}} />
      <Stack.Screen name="business-hours" options={{title: 'Business Hours'}} />
      <Stack.Screen name="license" options={{title: 'License & Billing'}} />

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
  );
}
