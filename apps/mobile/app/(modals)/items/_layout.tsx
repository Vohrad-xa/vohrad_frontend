import {useCallback} from 'react';
import {Platform, StyleSheet} from 'react-native';
import {Stack, useRouter} from 'expo-router';
import {HeaderButton, ScreenLoadingWrapper} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils';

export default function ItemsModalsLayout() {
  const {ds, theme} = useTheme();
  const router = useRouter();
  const styles = createStyles(ds, theme);

  const handleClose = useCallback(() => {
    router.dismiss();
  }, [router]);

  const CloseButton = useCallback(
    () => (
      <HeaderButton
        variant="close"
        onPress={handleClose}
        accessibilityLabel="Close"
      />
    ),
    [handleClose],
  );

  return (
    <ScreenLoadingWrapper>
      <Stack
        screenOptions={{
          headerShown: true,
          headerShadowVisible: false,
          headerTransparent: Platform.OS === 'ios',
          headerLeft: CloseButton,
          headerBackButtonDisplayMode: 'minimal',
          headerStyle:
            Platform.OS === 'android'
              ? {backgroundColor: theme.navigationBar}
              : undefined,
          headerTitleAlign: 'center',
          contentStyle: styles.container,
        }}
      >
        <Stack.Screen
          name="filters"
          options={{
            title: 'Item Filters',
            headerBackButtonDisplayMode: 'minimal',
          }}
        />
        <Stack.Screen
          name="location"
          options={{
            title: 'Locations',
          }}
        />
        <Stack.Screen
          name="specifications"
          options={{
            title: 'Specifications',
          }}
        />
      </Stack>
    </ScreenLoadingWrapper>
  );
}

const createStyles = makeStyleFactory(
  (_ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
