import React from 'react';
import {StyleSheet, Platform} from 'react-native';
import {Stack, useRouter} from 'expo-router';
import {HeaderButton} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {FilterContent} from '@/features/dashboard';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils';

export default function FilterModal() {
  const {ds, theme} = useTheme();
  const router = useRouter();
  const styles = createStyles(ds, theme);

  const handleClose = () => {
    router.dismiss();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Filter',
          headerShown: true,
          headerShadowVisible: false,
          headerTransparent: Platform.OS === 'ios',
          headerTitleStyle: styles.headerTitleStyle,
          headerTitleAlign: 'left',
          headerBackButtonDisplayMode: 'default',
          headerBackVisible: true,
          headerLeft: () =>
            Platform.OS !== 'ios' ? undefined : (
              <HeaderButton
                variant="close"
                accessibilityLabel="Close Filter Modal"
                onPress={handleClose}
              />
            ),
        }}
      />
      <FilterContent />
    </>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
      },
      headerTitleStyle: {
        fontWeight: ds.fontWeight.bold,
        color: Platform.OS !== 'ios' ? theme.headerAndroid : undefined,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
