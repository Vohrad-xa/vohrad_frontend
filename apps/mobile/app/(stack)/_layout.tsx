import React from 'react';
import {Stack} from 'expo-router';
export default function StackLayout() {
  return (
    <Stack>
      <Stack.Screen name="profile/index" options={{title: 'Profile'}} />
      <Stack.Screen name="events/index" options={{title: 'Events'}} />
      <Stack.Screen name="organization/index" options={{title: 'Organization'}} />
      <Stack.Screen name="help-support/index" options={{title: 'Help & Support'}} />
    </Stack>
  );
}
