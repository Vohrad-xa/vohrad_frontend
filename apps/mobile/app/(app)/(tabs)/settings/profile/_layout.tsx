import {useMemo} from 'react';
import {Platform} from 'react-native';
import {router, Stack} from 'expo-router';
import {HeaderButton} from '@/components/ui';
import {useTheme} from '@/providers';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function ProfileLayout() {
  const {theme, ds} = useTheme();

  const modalOptions = useMemo(
    () => ({
      presentation: 'modal' as const,
      headerLeft: () =>
        Platform.OS === 'ios' ? (
          <HeaderButton
            variant="close"
            accessibilityLabel="Close"
            accessibilityHint="Closes the modal"
            onPress={() => router.dismiss()}
          />
        ) : undefined,
    }),
    [],
  );

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        headerTransparent: Platform.OS === 'ios',
        headerTitleStyle: {
          fontSize: Platform.OS !== 'ios' ? 26 : undefined,
          color: Platform.OS !== 'ios' ? theme.headerAndroid : undefined,
        },
        headerLargeTitleStyle: {
          fontWeight: ds.fontWeight.bold,
        },
        contentStyle: {
          padding: Platform.OS !== 'ios' ? ds.spacing.md : undefined,
        },
      }}
    >
      <Stack.Screen name="index" options={{title: 'Profile'}} />
      <Stack.Screen
        name="birth-date"
        options={{title: 'Date of Birth', ...modalOptions}}
      />
      <Stack.Screen name="name" options={{title: 'Name', ...modalOptions}} />
      <Stack.Screen name="email" options={{title: 'Email', ...modalOptions}} />
      <Stack.Screen
        name="phone"
        options={{title: 'Phone Number', ...modalOptions}}
      />
      <Stack.Screen
        name="password"
        options={{title: 'Password', ...modalOptions}}
      />
      <Stack.Screen
        name="address"
        options={{title: 'Address', ...modalOptions}}
      />
    </Stack>
  );
}
