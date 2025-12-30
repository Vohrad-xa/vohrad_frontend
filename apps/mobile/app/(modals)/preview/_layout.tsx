import {Stack, router} from 'expo-router';
import {HeaderButton, ScreenLoadingWrapper} from '@/components/ui';
import {useTheme} from '@/providers';

const CloseHeaderLeft = () => (
  <HeaderButton
    variant="close"
    onPress={() => router.dismiss()}
    accessibilityLabel="Close preview"
  />
);

export default function PreviewModalLayout() {
  const {theme} = useTheme();

  return (
    <ScreenLoadingWrapper>
      <Stack
        screenOptions={{
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          contentStyle: {backgroundColor: theme.modalBackground},
          headerStyle: {backgroundColor: theme.modalBackground},
          headerLeft: () => <CloseHeaderLeft />,
        }}
      >
        <Stack.Screen name="image" options={{title: 'Preview'}} />
        <Stack.Screen name="document" options={{title: 'Document'}} />
      </Stack>
    </ScreenLoadingWrapper>
  );
}
