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
        animation: 'ios_from_right',
        headerBackButtonDisplayMode: 'minimal',
        headerTransparent: Platform.OS === 'ios',
        headerTitleAlign: 'left',
        headerTitleStyle: {
          color: Platform.OS !== 'ios' ? theme.headerAndroid : undefined,
          fontWeight: Platform.OS === 'android' ? 'bold' : undefined,
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
