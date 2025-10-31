import {Platform} from 'react-native';
import {Stack, useRouter} from 'expo-router';
import {HeaderButton} from '@/components/ui';
import {useTheme} from '@/providers';

export default function AuthModalsLayout() {
  const {theme} = useTheme();
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        contentStyle: {backgroundColor: theme.background},
        headerShown: true,
        headerTransparent: Platform.OS === 'ios',
        headerStyle:
          Platform.OS === 'android'
            ? {backgroundColor: theme.background}
            : undefined,
        headerShadowVisible: false,
        headerTitleStyle: {color: theme.text},
        headerTintColor: theme.text,
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen
        name="personal-email"
        options={{
          title: 'Login',
          headerRight: () => (
            <HeaderButton
              variant="close"
              onPress={() => router.dismiss()}
              accessibilityLabel="Close"
            />
          ),
        }}
      />
    </Stack>
  );
}
