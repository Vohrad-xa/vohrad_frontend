import {Platform} from 'react-native';
import {Stack, router} from 'expo-router';
import {HeaderButton, ScreenLoadingWrapper} from '@/components/ui';

const CloseButton = () => (
  <HeaderButton
    variant="close"
    onPress={() => router.dismiss()}
    accessibilityLabel="Close"
  />
);

export default function AttachmentsModalsLayout() {
  return (
    <ScreenLoadingWrapper>
      <Stack
        screenOptions={{
          headerShown: true,
          headerShadowVisible: false,
          headerTransparent: Platform.OS === 'ios',
          headerLeft: () => <CloseButton />,
          headerBackButtonDisplayMode: 'minimal',
          headerTitleAlign: 'center',
        }}
      >
        <Stack.Screen name="index" options={{title: 'Select Destination'}} />
        <Stack.Screen
          name="select"
          options={{title: 'Select', headerLeft: undefined}}
        />
      </Stack>
    </ScreenLoadingWrapper>
  );
}
