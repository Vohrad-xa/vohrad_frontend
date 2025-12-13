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
            headerBackButtonMenuEnabled: true,
            headerTransparent: Platform.OS === 'ios',
            headerTitleAlign: 'left',
            headerBackButtonDisplayMode: 'minimal',
            contentStyle: styles.container,
            headerTitleStyle: {
              fontWeight: ds.fontWeight.bold,
              color: Platform.OS !== 'ios' ? theme.headerAndroid : undefined,
            },
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: 'Settings',
              headerLeft: () => (
                <HeaderButton
                  variant="menu"
                  accessibilityLabel="Open menu"
                  onPress={toggleSideMenu}
                  style={
                    Platform.OS === 'android'
                      ? {marginRight: ds.spacing.md}
                      : undefined
                  }
                />
              ),
              headerRight: () => (
                <View style={styles.headerRightContainer}>
                  <HeaderButton
                    icon={AppIcons.navigation.event}
                    accessibilityLabel="Open events"
                    onPress={() => {}}
                  />
                </View>
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
              headerLargeTitle: true,
              headerSearchBarOptions: {
                placement: 'integratedButton',
                hideWhenScrolling: false,
                placeholder: 'Search...',
                onChangeText: handleSearchChange,
                headerIconColor: theme.text,
              },
            }}
          />
          <Stack.Screen
            name="organization/add-user"
            options={{title: 'Add User', presentation: 'modal'}}
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
  (theme: ThemeShape, ds: DSShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.background,
      },
      headerRightContainer: {
        flexDirection: 'row',
        gap: Platform.OS === 'ios' && 'web' ? ds.spacing.xs : undefined,
      },
    }),
  (theme, ds) => themeKey(theme, ds),
);
