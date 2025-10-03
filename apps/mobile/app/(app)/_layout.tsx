import {Platform} from 'react-native';
import {Stack} from 'expo-router';
import {HeaderButton} from '@/components/ui';
import {SidebarContainer} from '@/features/side-bar/sidebar-container';
import {HeaderVisibilityProvider, SidebarProvider, useSidebar, useTheme} from '@/providers';
import {AppIcons} from '@/utils';

function AppStack() {
  const {theme} = useTheme();
  const {toggleSideMenu} = useSidebar();

  return (
    <SidebarContainer>
      <Stack
        initialRouteName="(tabs)"
        screenOptions={{
          contentStyle: {backgroundColor: theme.background},
          headerShown: true,
          headerTransparent: Platform.OS === 'ios',
          headerStyle: Platform.OS === 'android' ? {backgroundColor: theme.navigationBar} : undefined,
          headerTitleStyle: {color: theme.text},
          headerTitleAlign: 'center',
          headerLeft: () => (
            <HeaderButton icon={AppIcons.navigation.menu} accessibilityLabel="Open menu" onPress={toggleSideMenu} />
          ),
        }}>
        {/* <Stack.Screen name="(tabs)" /> */}
        <Stack.Screen
          name="(modals)"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
      </Stack>
    </SidebarContainer>
  );
}

export default function AppLayout() {
  return (
    <HeaderVisibilityProvider>
      <SidebarProvider>
        <AppStack />
      </SidebarProvider>
    </HeaderVisibilityProvider>
  );
}
