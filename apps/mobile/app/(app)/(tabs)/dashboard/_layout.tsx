import {Platform} from 'react-native';
import {Stack} from 'expo-router';
import {HeaderButton} from '@/components/ui';
import {useTheme, useSidebar} from '@/providers';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function HomeLayout() {
  const {theme, ds} = useTheme();
  const {toggleSideMenu} = useSidebar();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerLargeTitle: true,
        animation: 'ios_from_right',
        headerBackButtonDisplayMode: 'minimal',
        headerTransparent: Platform.OS === 'ios',
        headerTitleAlign: 'left',
        headerTitleStyle: {
          fontWeight: ds.fontWeight.bold,
          color: Platform.OS !== 'ios' ? theme.headerAndroid : undefined,
        },
        headerLargeTitleStyle: {
          fontWeight: ds.fontWeight.bold,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: 'Dashboard',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <HeaderButton
              variant="menu"
              accessibilityLabel="Open side bar menu"
              onPress={toggleSideMenu}
            />
          ),
        }}
      />
      <Stack.Screen
        name="scan"
        options={{
          headerTitleAlign: 'center',
          headerLargeTitle: false,
          presentation: 'fullScreenModal',
        }}
      />
    </Stack>
  );
}
