import {Stack} from 'expo-router';

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="settings" />
      <Stack.Screen name="filter" />
      <Stack.Screen name="scan" />
    </Stack>
  );
}
