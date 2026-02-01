import {Stack, router} from 'expo-router';
import {HeaderButton, ScreenLoadingWrapper} from '@/components/ui';

const CloseHeaderLeft = () => (
  <HeaderButton
    variant="close"
    onPress={() => router.dismiss()}
    accessibilityLabel="Close preview"
    iconColorToken="accentBlue"
  />
);

export default function PreviewModalLayout() {
  return (
    <ScreenLoadingWrapper>
      <Stack
        screenOptions={{
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerTransparent: true,
          headerBlurEffect: 'systemThinMaterial',
          headerLeft: () => <CloseHeaderLeft />,
          scrollEdgeEffects: {
            top: 'hidden',
            bottom: 'hidden',
            left: 'hidden',
            right: 'hidden',
          },
        }}
      >
        <Stack.Screen name="image" options={{title: 'Preview'}} />
        <Stack.Screen
          name="document"
          options={{
            title: 'Document',
          }}
        />
      </Stack>
    </ScreenLoadingWrapper>
  );
}
