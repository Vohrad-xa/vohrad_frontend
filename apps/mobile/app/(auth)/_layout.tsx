import React from 'react';
import {Platform} from 'react-native';
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
  const {theme} = useTheme();

  return (
    <AuthLayout>
      <Stack screenOptions={{headerShown: false}}>
        <Stack.Screen name="login" />
        <Stack.Screen
          name="(modals)/personal-email"
          options={{
            presentation: 'modal',
            headerShown: true,
            headerTitle: 'Login',
            headerTransparent: Platform.OS === 'ios',
            contentStyle: {backgroundColor: theme.background},
            headerStyle: Platform.OS === 'android' ? {backgroundColor: theme.background} : undefined,
            headerTitleStyle: {color: theme.text},
            headerTintColor: theme.text,
            headerRight: () => <HeaderButton icon="close-outline" onPress={() => router.dismiss()} />,
          }}
        />
      </Stack>
    </AuthLayout>
  );
}
