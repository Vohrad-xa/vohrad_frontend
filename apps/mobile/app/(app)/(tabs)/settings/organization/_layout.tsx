import {useMemo} from 'react';
import {Platform} from 'react-native';
import {Stack} from 'expo-router';
import {useTheme} from '@/providers';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function OrganizationLayout() {
  const {theme, ds} = useTheme();

  const screenOptions = useMemo(
    () => ({
      headerShown: true,
      headerShadowVisible: false,
      headerBackButtonDisplayMode: 'minimal' as const,
      headerTransparent: Platform.OS === 'ios',
      headerTitleStyle: {
        fontSize: Platform.OS !== 'ios' ? 26 : undefined,
        color: Platform.OS !== 'ios' ? theme.headerAndroid : undefined,
      },
      headerLargeTitleStyle: {
        fontWeight: ds.fontWeight.bold,
      },
    }),
    [ds.fontWeight.bold, ds.spacing.md, theme.headerAndroid],
  );

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="index" options={{title: 'Organization'}} />
      <Stack.Screen name="organization-info" options={{title: 'Details'}} />
    </Stack>
  );
}
