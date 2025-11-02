import {Platform} from 'react-native';
import {Stack} from 'expo-router';
import {useTheme} from '@/providers';

export default function EventsLayout() {
  const {theme} = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerTransparent: Platform.OS === 'ios',
        headerStyle: {
          backgroundColor:
            Platform.OS === 'android' ? theme.navigationBar : undefined,
        },
        headerTitleStyle: {color: theme.text},
        headerTitleAlign: 'center',
        contentStyle: {
          backgroundColor: theme.background,
        },
      }}
    />
  );
}
