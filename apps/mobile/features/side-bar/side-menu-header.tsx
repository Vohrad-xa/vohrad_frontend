import React from 'react';
import {View, StyleSheet, Platform, StatusBar} from 'react-native';
import {
  GlassView,
  GlassContainer,
  isLiquidGlassAvailable,
} from 'expo-glass-effect';
import {Searchbar} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AnimatedBlurView, HeaderButton} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';
import type {SharedValue} from 'react-native-reanimated';

interface SideMenuHeaderProps {
  onClose: () => void;
  blurIntensity: SharedValue<number>;
}

export function SideMenuHeader({onClose, blurIntensity}: SideMenuHeaderProps) {
  const {theme, ds, scheme} = useTheme();
  const insets = useSafeAreaInsets();

  const topPadding =
    Platform.OS === 'android'
      ? (StatusBar.currentHeight ?? 0) + ds.spacing.lg
      : Math.max(insets.top, ds.spacing.xl);

  const isDark = scheme === 'dark';
  const styles = createStyles(theme, ds, topPadding, isDark);
  const hasLiquidGlass = Platform.OS === 'ios' && isLiquidGlassAvailable();

  const Search = (
    <Searchbar style={styles.searchBar} placeholder="Search" value="" />
  );

  const Close = (
    <HeaderButton
      variant="close"
      onPress={onClose}
      accessibilityLabel="Close side menu"
    />
  );

  return (
    <AnimatedBlurView
      blurIntensity={blurIntensity}
      tint={isDark ? 'dark' : 'light'}
      style={styles.headerBlurView}
    >
      {hasLiquidGlass ? (
        <GlassContainer spacing={10} style={styles.row}>
          <GlassView
            isInteractive
            glassEffectStyle="regular"
            style={styles.pill}
          >
            {Search}
          </GlassView>

          <GlassView
            isInteractive
            glassEffectStyle="regular"
            style={styles.square}
          >
            {Close}
          </GlassView>
        </GlassContainer>
      ) : (
        <View style={styles.row}>
          <View style={[styles.pill, styles.fallbackSurface]}>{Search}</View>
          <View style={[styles.square, styles.fallbackSurface]}>{Close}</View>
        </View>
      )}
    </AnimatedBlurView>
  );
}

const createStyles = makeStyleFactory(
  (theme: ThemeShape, ds: DSShape, topPadding: number, _isDark: boolean) =>
    StyleSheet.create({
      headerBlurView: {
        paddingHorizontal: ds.spacing.lg,
        paddingTop: topPadding,
        paddingBottom: ds.spacing.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
      },

      row: {
        flexDirection: 'row',
      },
      pill: {
        flex: 1,
        borderRadius: 50,
      },
      square: {
        borderRadius: 50,
        width: 44,
        height: 44,
        justifyContent: 'center',
      },

      fallbackSurface: {
        backgroundColor: theme.card,
        borderWidth: StyleSheet.hairlineWidth,
      },

      searchBar: {
        height: 44,
        backgroundColor: 'transparent',
        elevation: 0,
      },
    }),
  (theme, ds, topPadding, isDark) =>
    `${themeKey(theme, ds)}|${topPadding}|${isDark ? 'd' : 'l'}`,
);
