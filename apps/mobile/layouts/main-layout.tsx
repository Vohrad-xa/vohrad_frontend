import {Platform} from 'react-native';
import {Stack} from 'expo-router';
import {HeaderButton} from '@/components/ui';
import {SidebarContainer} from '@/features/side_bar/sidebar-container';
import {HeaderVisibilityProvider, SidebarProvider, useTheme, useSidebar} from '@/providers';
import {AppIcons} from '@/utils';

function InnerMainLayout() {
  const {theme} = useTheme();
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
            headerShown: false,
          }}
        />
        <Stack.Screen name="(stack)" options={{headerShown: false}} />
      </Stack>
    </SidebarContainer>
  );
}

export function MainLayout() {
  return (
    <HeaderVisibilityProvider>
      <SidebarProvider>
        <InnerMainLayout />
      </SidebarProvider>
    </HeaderVisibilityProvider>
  );
}
