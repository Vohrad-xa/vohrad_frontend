import {Platform} from 'react-native';
import {Stack, router} from 'expo-router';
import {HeaderButton} from '@/components/ui';

const CloseHeaderLeft = () => (
  <HeaderButton
    variant="close"
    onPress={() => router.dismiss()}
    accessibilityLabel="Close screen"
  />
);

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerTransparent: Platform.OS === 'ios',
        headerLeft: Platform.OS === 'ios' ? CloseHeaderLeft : undefined,
      }}
    >
      <Stack.Screen name="items/location" options={{title: 'Locations'}} />
      <Stack.Screen
        name="items/specifications"
        options={{title: 'Specifications'}}
      />
      <Stack.Screen
        name="attachments/index"
        options={{title: 'Select Destination'}}
      />

      <Stack.Screen name="attachments/select" options={{title: 'Select'}} />

      <Stack.Screen
        name="preview/image"
        options={{
          title: 'Preview',
        }}
      />
      <Stack.Screen
        name="preview/document"
        options={{
          title: 'Document',
          headerTransparent: true,
          headerBlurEffect: 'systemThinMaterial',
          scrollEdgeEffects: {
            top: 'hidden',
            bottom: 'hidden',
            left: 'hidden',
            right: 'hidden',
          },
        }}
      />
    </Stack>
  );
}
