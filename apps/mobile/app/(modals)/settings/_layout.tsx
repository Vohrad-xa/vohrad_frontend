import React, {useCallback} from 'react';
import {Platform, StyleSheet} from 'react-native';
import {Stack, useRouter} from 'expo-router';
import {HeaderButton, ScreenLoadingWrapper} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {SearchProvider, useSearch} from '@/features/dashboard';
import {useTheme} from '@/providers';
import {AppIcons, makeStyleFactory} from '@/utils';

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
  const router = useRouter();
  const styles = createStyles(theme, ds);

  const handleSearchChange = useCallback(
    (event: SearchChangeEvent) => {
      setSearchQuery(event.nativeEvent.text);
    },
    [setSearchQuery],
  );

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
            headerLeft: () => (
              <HeaderButton
                icon={
                  Platform.OS === 'ios'
                    ? AppIcons.navigation.close
                    : AppIcons.navigation.back
                }
                onPress={() => router.dismiss()}
                iconColorToken="text"
                accessibilityLabel="Close settings"
                iconSize="lg"
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
        <Stack.Screen name="app-settings" options={{title: 'App Settings'}} />
        <Stack.Screen name="privacy" options={{title: 'Privacy Policy'}} />
        <Stack.Screen name="terms" options={{title: 'Terms of Use'}} />
        <Stack.Screen name="about" options={{title: 'About'}} />
        <Stack.Screen
          name="organization/business-details"
          options={{title: 'Business Details'}}
        />
        <Stack.Screen name="organization/plan" options={{title: 'Plan'}} />
        <Stack.Screen
          name="organization/users"
          options={{
            title: 'Users',
            headerSearchBarOptions: {
              headerIconColor: theme.text,
              placement: 'automatic',
              hideWhenScrolling: false,
              placeholder: 'Search...',
              onChangeText: handleSearchChange,
            },
          }}
        />
        <Stack.Screen
          name="organization/add-user"
          options={{title: 'Add User', presentation: 'modal'}}
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
