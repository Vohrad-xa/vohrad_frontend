import React from 'react';
import {StyleSheet, Platform} from 'react-native';
import {Stack, useRouter} from 'expo-router';
import {HeaderButton, ModalScrollView, ThemedView} from '@/components/ui';
import {type DSShape, type ThemeShape} from '@/constants/theme';
import {FilterContent} from '@/features/home/overview/filter';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';

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
          headerTransparent: Platform.OS === 'ios',
          headerStyle:
            Platform.OS === 'android' ? styles.headerStyleAndroid : undefined,
          headerTitleStyle: styles.headerTitleStyle,
          headerTitleAlign: 'center',
          headerBackButtonDisplayMode: 'minimal',
          headerLeft: () => (
            <HeaderButton
              variant="close"
              onPress={handleClose}
              accessibilityLabel="Close filters"
            />
          ),
        }}
      />
      <ThemedView style={styles.container}>
        <ModalScrollView>
          <FilterContent />
        </ModalScrollView>
      </ThemedView>
    </>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
      },
      headerStyleAndroid: {
        backgroundColor: theme.navigationBar,
      },
      headerTitleStyle: {
        color: theme.text,
      },
    }),
  (ds, theme) => `${theme.version}|${ds.version}`,
);
