import {Platform} from 'react-native';
import {Stack} from 'expo-router';
import {useTheme} from '@/providers';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function HomeLayout() {
  const {theme} = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerLargeTitle: true,
        headerBackButtonDisplayMode: 'minimal',
        headerTransparent: Platform.OS === 'ios',
        headerTitleStyle: {
          color: Platform.OS !== 'ios' ? theme.headerAndroid : undefined,
          fontSize: Platform.OS !== 'ios' ? 22 : undefined,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: 'Dashboard',
          headerTitleStyle: {
            fontWeight: Platform.OS === 'android' ? 'bold' : '600',
            color: Platform.OS !== 'ios' ? theme.headerAndroid : undefined,
            fontSize: Platform.OS !== 'ios' ? 26 : undefined,
          },
        }}
      />
      <Stack.Screen
        name="scan"
        options={{
          headerLargeTitle: false,
          presentation: 'fullScreenModal',
        }}
      />
    </Stack>
  );
}
