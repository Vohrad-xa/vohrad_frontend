import {Stack} from 'expo-router';

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="dashboard/cards-filter" options={{title: 'Filter'}} />
      <Stack.Screen name="items" options={{title: 'Items'}} />
      <Stack.Screen name="preview" options={{title: 'Preview'}} />
      <Stack.Screen name="attachments" options={{title: 'Attachments'}} />
    </Stack>
  );
}
