import {Platform} from 'react-native';
import {ActionSheetProvider} from '@expo/react-native-action-sheet';
import {Stack, router} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SidebarContainer} from '@/components/side-bare/sidebar-container';
import {HeaderButton} from '@/components/ui';
import {HeaderVisibilityProvider, SidebarProvider, AppThemeProvider, useTheme, useSidebar} from '@/providers';

import {AppIcons} from '@/utils';

export const unstable_settings = {
  anchor: '(tabs)',
};

function InnerApp() {
  const {scheme, theme} = useTheme();
  const {toggleSideMenu} = useSidebar();

  return (
    <SidebarContainer>
      <Stack
        screenOptions={{
          contentStyle: {backgroundColor: theme.background},
          headerShown: true,
          headerTransparent: Platform.OS === 'ios',
          headerStyle: Platform.OS === 'android' ? {backgroundColor: theme.background} : undefined,
          headerTitleStyle: {color: theme.text},
          headerTitleAlign: 'center',
          headerLeft: () => (
            <HeaderButton icon={AppIcons.navigation.menu} accessibilityLabel="Open menu" onPress={toggleSideMenu} />
          ),
        }}>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="(modals)/settings"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Settings',
            gestureEnabled: true,
            headerLeft: () => null,
            headerRight: () => (
              <HeaderButton icon={AppIcons.navigation.close} accessibilityLabel="Close" onPress={() => router.back()} />
            ),
          }}
        />
        <Stack.Screen name="(stack)" options={{headerShown: false}} />
      </Stack>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
    </SidebarContainer>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <ActionSheetProvider>
        <AppThemeProvider>
          <HeaderVisibilityProvider>
            <SidebarProvider>
              <InnerApp />
            </SidebarProvider>
          </HeaderVisibilityProvider>
        </AppThemeProvider>
      </ActionSheetProvider>
    </GestureHandlerRootView>
  );
}
