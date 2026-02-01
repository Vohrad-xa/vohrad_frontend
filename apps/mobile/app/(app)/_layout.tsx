import {Platform} from 'react-native';
import {Stack} from 'expo-router';
import {ThemedStatusBar} from '@/components/ui';

function AppStack() {
  return (
    <Stack screenOptions={{headerShown: false}}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="(modals)"
        options={{
          presentation: Platform.OS === 'ios' ? 'modal' : 'transparentModal',
        }}
      />
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
