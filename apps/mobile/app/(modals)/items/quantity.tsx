import React from 'react';
import {StyleSheet, Platform, View} from 'react-native';
import {Stack, useRouter} from 'expo-router';
import {HeaderButton, ModalScrollView, ThemedView} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme, useHaptic} from '@/providers';
import {AppIcons} from '@/utils';
import {makeStyleFactory} from '@/utils/style-factory';

export default function QuantityModal() {
  const {ds, theme} = useTheme();
  const {triggerHaptic} = useHaptic();
  const router = useRouter();
  const styles = createStyles(ds, theme);

  const handleClose = () => {
    triggerHaptic('light');
    router.dismiss();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Quantity',
          headerShown: true,
          headerTransparent: Platform.OS === 'ios',
          headerStyle:
            Platform.OS === 'android' ? styles.headerStyleAndroid : undefined,
          headerTitleStyle: styles.headerTitleStyle,
          headerTitleAlign: 'center',
          headerLeft: () => (
            <HeaderButton
              icon={AppIcons.navigation.close}
              onPress={handleClose}
              accessibilityLabel="Close quantity"
            />
          ),
        }}
      />
      <ThemedView style={styles.container}>
        <ModalScrollView>
          <View style={{padding: ds.spacing.md}}>
            {/* Quantity content will go here */}
          </View>
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
        backgroundColor: theme.secondbackground,
      },
      headerStyleAndroid: {
        backgroundColor: theme.background,
      },
      headerTitleStyle: {
        color: theme.text,
        fontFamily: 'System',
        fontWeight: '600',
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
