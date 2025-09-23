import {Platform} from 'react-native';
import {ActionSheetProvider} from '@expo/react-native-action-sheet';
import {Stack, router} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SidebarContainer} from '@/components/side-bare/sidebar-container';
import {HeaderButton, Switch} from '@/components/ui';
import {HeaderVisibilityProvider, SidebarProvider, AppThemeProvider, useTheme} from '@/providers';
import {useSidebar} from '@/providers';
import {AppIcons} from '@/utils';

export const unstable_settings = {
  anchor: '(tabs)',
};

function InnerApp() {
  const {scheme, theme, toggle} = useTheme();
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
          headerRight: () => <Switch value={scheme === 'dark'} onValueChange={toggle} />,
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
            title: 'Settings',
            gestureEnabled: true,
            headerLeft: () => <HeaderButton icon={AppIcons.status.info} accessibilityLabel="Help" />,
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
