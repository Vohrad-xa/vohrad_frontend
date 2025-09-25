import React from 'react';
import {Stack, useRouter} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import {HeaderButton} from '@/components/ui';
import {useTheme} from '@/providers';

interface AuthLayoutProps {
  children: React.ReactNode;
}

function AuthLayout({children}: AuthLayoutProps) {
  const {scheme} = useTheme();

  return (
    <>
      {children}
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}

export default function AuthGroupLayout() {
  const router = useRouter();

  return (
    <AuthLayout>
      <Stack screenOptions={{headerShown: false}}>
        <Stack.Screen name="login" />
        <Stack.Screen
          name="(modals)/personal-email"
          options={{
            presentation: 'modal',
            headerTransparent: false,
            headerShown: true,
            headerTitle: 'Login',
            headerRight: () => <HeaderButton icon="close-outline" onPress={() => router.dismiss()} />,
          }}
        />
      </Stack>
    </AuthLayout>
  );
}
