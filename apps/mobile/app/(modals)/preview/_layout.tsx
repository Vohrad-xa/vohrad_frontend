import {useCallback} from 'react';
import {Platform} from 'react-native';
import {Stack, useRouter} from 'expo-router';
import {HeaderButton, ScreenLoadingWrapper} from '@/components/ui';

export default function PreviewModalLayout() {
  const router = useRouter();

  const handleClose = useCallback(() => {
    router.dismiss();
  }, [router]);

  return (
    <ScreenLoadingWrapper>
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerTransparent: Platform.OS === 'ios',
          headerBlurEffect:
            Platform.OS === 'ios' ? 'systemUltraThinMaterial' : undefined,
          headerLeft: () => (
            <HeaderButton
              variant="close"
              onPress={handleClose}
              accessibilityLabel="Close preview"
            />
          ),
        }}
      >
        <Stack.Screen
          name="image"
          options={{
            title: 'Preview',
          }}
        />
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
