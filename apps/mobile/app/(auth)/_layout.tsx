import React from 'react';
import {Stack} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
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
  return (
    <AuthLayout>
      <Stack screenOptions={{headerShown: false}}>
        <Stack.Screen name="login" />
        <Stack.Screen
          name="(modals)"
          options={{
            presentation: 'modal',
          }}
        />
      </Stack>
    </AuthLayout>
  );
}
