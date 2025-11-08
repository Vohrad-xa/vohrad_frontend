import React, {useCallback, useLayoutEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import {themeKey, type DSShape, type ThemeShape} from '@/constants';
import {useRouter, useNavigation} from 'expo-router';
import {HeaderButton} from '@/components/ui';
import {useSearch} from '@/features/dashboard';
import {useTheme} from '@/providers';
import {AppIcons, makeStyleFactory} from '@/utils';
import {ThemedText} from '@/components/ui';

export default function VaultScreen() {
  const {ds, theme} = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const styles = createStyles(ds, theme);
  const {searchQuery} = useSearch();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderButton
          icon={AppIcons.navigation.filter}
          accessibilityLabel="Filter vault"
          iconSize="xl"
          onPress={() => {
            // Filter functionality placeholder
          }}
        />
      ),
    });
  }, [navigation, router]);

  return (
    <View style={styles.container}>
      <ThemedText variant="body">Vault content coming soon...</ThemedText>
    </View>
  );
}

const createStyles = makeStyleFactory(
  (_ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
      },
    }),
  (ds, theme) => `${themeKey(theme, ds)}`,
);
