import {Stack} from 'expo-router';

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="dashboard/cards-filter" options={{title: 'Filter'}} />
      <Stack.Screen name="items/location" options={{title: 'Locations'}} />
      <Stack.Screen
        name="items/specifications"
        options={{title: 'Specifications'}}
      />
      <Stack.Screen
        name="items/advanced-filter"
        options={{title: 'Advanced Filters'}}
      />
      <Stack.Screen name="preview" options={{title: 'Preview'}} />
      <Stack.Screen name="attachments" options={{title: 'Attachments'}} />
    </Stack>
  );
}
