import {Platform} from 'react-native';
import {Stack} from 'expo-router';
import {useTheme} from '@/providers';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function HomeLayout() {
  const {theme, ds} = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerLargeTitle: true,
        headerBackButtonDisplayMode: 'minimal',
        headerTransparent: Platform.OS === 'ios',
        headerTitleAlign: 'left',
        headerTitleStyle: {
          fontWeight: ds.fontWeight.bold,
          fontSize: Platform.OS !== 'ios' ? 24 : undefined,
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
