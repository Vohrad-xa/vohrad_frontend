import {useCallback, useMemo} from 'react';
import {Platform} from 'react-native';
import {type NativeStackNavigationOptions} from '@react-navigation/native-stack';
import {Stack, router} from 'expo-router';
import {SearchProvider, useSearch, useTheme} from '@/providers';
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
  const {theme} = useTheme();
  const {setSearchQuery} = useSearch();

  const handleSearchChange = useCallback(
    (event: SearchChangeEvent) => {
      setSearchQuery(event.nativeEvent.text);
    },
    [setSearchQuery],
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

  const headerSearchBarOptions = useMemo(
    () =>
      ({
        placement: 'inline',
        inputType: 'text',
        placeholder: 'Search',
        hideWhenScrolling: false,
        headerIconColor: theme.icon,
        hintTextColor: theme.icon,
        textColor: theme.text,
        shouldShowHintSearchIcon: true,
        onChangeText: handleSearchChange,
      }) satisfies NativeStackNavigationOptions['headerSearchBarOptions'],
    [handleSearchChange, theme.icon, theme.text],
  );

  return (
    <Stack screenOptions={stackScreenOptions}>
      <Stack.Screen name="index" options={{title: 'Settings'}} />
      <Stack.Screen name="language" options={{title: 'Language'}} />
      <Stack.Screen name="help" options={{title: 'Help'}} />
      <Stack.Screen name="app-settings" options={{title: 'App Settings'}} />
      <Stack.Screen name="data-usage" options={{title: 'Data Usage'}} />
      <Stack.Screen name="privacy" options={{title: 'Privacy Policy'}} />
      <Stack.Screen name="terms" options={{title: 'Terms of Use'}} />
      <Stack.Screen name="about" options={{title: 'About'}} />

      <Stack.Screen
        name="profile"
        options={{headerShown: Platform.OS === 'ios'}}
      />

      {/* Tenant screens */}
      <Stack.Screen name="tenant/index" options={{title: 'Tenant'}} />
      <Stack.Screen name="tenant/tenant-info" options={{title: 'Details'}} />
      <Stack.Screen
        name="tenant/business-hours"
        options={{title: 'Business Hours'}}
      />
      <Stack.Screen
        name="tenant/license"
        options={{title: 'License & Billing'}}
      />
      <Stack.Screen
        name="tenant/users/index"
        options={{title: 'Users', headerSearchBarOptions}}
      />
      <Stack.Screen
        name="tenant/users/add-user"
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

export default function SettingsLayout() {
  return (
    <SearchProvider>
      <SettingsStack />
    </SearchProvider>
  );
}
