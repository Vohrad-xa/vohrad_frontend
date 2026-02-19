import React from 'react';
import {Platform} from 'react-native';
import {Stack, useRouter} from 'expo-router';
import {
  ThemedStatusBar,
  ScreenLoadingWrapper,
  HeaderButton,
} from '@/components/ui';
import {useTheme} from '@/providers';

export default function AuthGroupLayout() {
  const {theme} = useTheme();
  const router = useRouter();

  return (
    <ScreenLoadingWrapper>
      <Stack screenOptions={{headerShown: false}}>
        <Stack.Screen name="login" />
        <Stack.Screen
          name="sign-in"
          options={{
            title: 'Login',
            headerShown: true,
            presentation: 'modal',
            headerShadowVisible: false,
            headerTransparent: Platform.OS === 'ios',
            contentStyle: {
              backgroundColor:
                Platform.OS === 'ios' ? theme.modalBackground : 'none',
            },
            headerLeft: () =>
              Platform.OS === 'ios' ? (
                <HeaderButton
                  variant="close"
                  onPress={() => router.dismiss()}
                  accessibilityLabel="Close login form"
                />
              ) : undefined,
          }}
        />
      </Stack>
      <ThemedStatusBar />
    </ScreenLoadingWrapper>
  );
}
