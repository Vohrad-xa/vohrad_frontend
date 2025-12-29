import React, {useCallback} from 'react';
import {Platform, StyleSheet, View} from 'react-native';
import {Stack} from 'expo-router';
import {HeaderButton, ScreenLoadingWrapper} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {SearchProvider, useSearch} from '@/features/dashboard';
import {useTheme, useSidebar} from '@/providers';
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
  const styles = createStyles(theme, ds);
  const {toggleSideMenu} = useSidebar();

  const handleSearchChange = useCallback(
    (event: SearchChangeEvent) => {
      setSearchQuery(event.nativeEvent.text);
    },
    [setSearchQuery],
  );

  return (
    <View style={styles.container}>
      <ScreenLoadingWrapper>
        <Stack
          screenOptions={{
            headerShown: true,
            headerShadowVisible: false,
            headerBackButtonMenuEnabled: false,
            animation: 'ios_from_right',
            headerTransparent: Platform.OS === 'ios',
            headerTitleAlign: 'left',
            headerBackButtonDisplayMode: 'minimal',
            contentStyle: styles.container,
            headerTitleStyle: {
              fontSize:
                Platform.OS === 'android'
                  ? ds.typography.title3.fontSize
                  : undefined,
              fontWeight: ds.fontWeight.bold,
              color: Platform.OS !== 'ios' ? theme.headerAndroid : undefined,
            },
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: 'Settings',
              headerTitleAlign: 'center',
              headerLeft: () => (
                <HeaderButton
                  variant="menu"
                  accessibilityLabel="Open menu"
                  onPress={toggleSideMenu}
                />
              ),
              headerRight: () => (
                <HeaderButton
                  icon={AppIcons.tabs.notifications}
                  accessibilityLabel="Open events"
                  onPress={() => {}}
                />
              ),
              headerSearchBarOptions: {
                placement: 'integratedButton',
                hideWhenScrolling: false,
                placeholder: 'Search...',
                onChangeText: handleSearchChange,
                headerIconColor: theme.text,
              },
            }}
          />
          <Stack.Screen name="profile" options={{title: 'Profile'}} />
          <Stack.Screen
            name="preferences"
            options={{
              title: 'Preferences',
              headerBackButtonMenuEnabled: false,
            }}
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
          <Stack.Screen
            name="users/index"
            options={{
              title: 'Users',
              headerLargeTitle: true,
              headerSearchBarOptions: {
                placement: 'integratedButton',
                placeholder: 'Search...',
                onChangeText: handleSearchChange,
                headerIconColor: theme.text,
              },
            }}
          />
          <Stack.Screen
            name="users/add-user"
            options={{
              title: 'Add User',
            }}
          />
        </Stack>
      </ScreenLoadingWrapper>
    </View>
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
        backgroundColor: theme.background,
      },
    }),
  (theme, _ds) => themeKey(theme, _ds),
);
