import {Stack} from 'expo-router';
import {ThemedStatusBar} from '@/components/ui';

function AppStack() {
  return (
    <Stack screenOptions={{headerShown: false}}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function AppLayout() {
  return (
    <>
      <ThemedStatusBar />
      <AppStack />
    </>
  );
}
