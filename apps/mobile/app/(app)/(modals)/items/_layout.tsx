import {Platform} from 'react-native';
import {Stack, router} from 'expo-router';
import {HeaderButton, ScreenLoadingWrapper} from '@/components/ui';
import {useTheme} from '@/providers';

const CloseHeaderLeft = () => (
  <HeaderButton
    variant="close"
    onPress={() => router.dismiss()}
    accessibilityLabel="Close"
  />
);

export default function ItemsModalsLayout() {
  const {theme} = useTheme();

  return (
    <ScreenLoadingWrapper>
      <Stack
        screenOptions={{
          headerShown: true,
          headerShadowVisible: false,
          headerTransparent: Platform.OS === 'ios',
          headerLeft: () => <CloseHeaderLeft />,
          headerBackButtonDisplayMode: 'minimal',
          headerTitleAlign: 'center',
          contentStyle: {backgroundColor: theme.modalBackground},
        }}
      >
        <Stack.Screen name="filters" options={{title: 'Item Filters'}} />
        <Stack.Screen name="location" options={{title: 'Locations'}} />
        <Stack.Screen
          name="specifications"
          options={{title: 'Specifications'}}
        />
      </Stack>
    </ScreenLoadingWrapper>
  );
}
