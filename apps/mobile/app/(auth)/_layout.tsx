import React from 'react';
import {Stack} from 'expo-router';
import {ThemedStatusBar} from '@/components/ui';

interface AuthLayoutProps {
  children: React.ReactNode;
}

function AuthLayout({children}: AuthLayoutProps) {
  return (
    <>
      {children}
      <ThemedStatusBar />
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
