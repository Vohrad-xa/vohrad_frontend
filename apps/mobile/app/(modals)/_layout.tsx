import {Stack} from 'expo-router';

export default function ModalsLayout() {
  return (
    <Stack screenOptions={{headerShown: false}}>
      <Stack.Screen name="settings" />
      <Stack.Screen name="filter/index" options={{title: 'Filter'}} />
      <Stack.Screen name="scan/index" options={{title: 'Scan'}} />
    </Stack>
  );
}
