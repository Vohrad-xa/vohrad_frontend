import {Platform} from 'react-native';
import {Stack, router} from 'expo-router';
import {SearchProvider, useSearch, useTheme} from '@/providers';
import {
  baseStackOptions,
  searchOptions,
  sectionTitleStyle,
  getHeaderOptions,
  type SearchChangeEvent,
} from '@/utils/navigation';

export const unstable_settings = {
  initialRouteName: 'index',
};

function SettingsStack() {
  const {theme} = useTheme();
  const {setSearchQuery} = useSearch();

  const onSearchChange = (event: SearchChangeEvent) => {
    setSearchQuery(event.nativeEvent.text);
  };

  const screenOptions = baseStackOptions(theme);
  const search = searchOptions(theme, onSearchChange);
  const titleSyle = sectionTitleStyle(theme);

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen
        name="index"
        options={{
          title: 'Settings',
          headerTitleStyle: titleSyle,
        }}
      />
      <Stack.Screen name="language" options={{title: 'Language'}} />
      <Stack.Screen name="help" options={{title: 'Help'}} />
      <Stack.Screen name="app-settings" options={{title: 'App Settings'}} />
      <Stack.Screen name="privacy" options={{title: 'Privacy and Security'}} />
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
        options={{title: 'Users', headerSearchBarOptions: search}}
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
