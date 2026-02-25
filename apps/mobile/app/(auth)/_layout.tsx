import React from 'react';
import {Stack} from 'expo-router';
import {ThemedStatusBar, ScreenLoadingWrapper} from '@/components/ui';

export default function AuthGroupLayout() {
  return (
    <ScreenLoadingWrapper>
      <Stack screenOptions={{headerShown: false}}>
        <Stack.Screen name="login" />
      </Stack>
      <ThemedStatusBar />
    </ScreenLoadingWrapper>
  );
}
