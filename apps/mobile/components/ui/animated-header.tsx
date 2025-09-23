import React from 'react';
import {View, StyleSheet, Platform, StatusBar} from 'react-native';
import {BlurView} from 'expo-blur';
import Animated, {useAnimatedStyle, interpolateColor, withTiming, useDerivedValue} from 'react-native-reanimated';
import {useSafeAreaInsets, type EdgeInsets} from 'react-native-safe-area-context';
import {ThemedText} from './themed-text';
import type {Tokens} from '@/constants/colors';
import type {DesignSystem} from '@/constants/typography';
import {useTheme} from '@/providers';
import type {SharedValue} from 'react-native-reanimated';

export interface AnimatedHeaderProps {
  title?: string;
  scrollValue: SharedValue<number>;
  rightAction?: React.ReactNode;
  children?: React.ReactNode;
}

// Height calculation function
export const calculateAnimatedHeaderHeight = (ds: typeof DesignSystem, insets: EdgeInsets) => {
  const topPadding =
    Platform.OS === 'android'
      ? (StatusBar.currentHeight ?? 0) + ds.spacing.lg
      : Platform.OS === 'ios'
        ? ds.spacing.sm
        : ds.spacing.xl;

  // Height is top padding + vertical padding of content wrapper + approximate title height
  return topPadding + ds.spacing.md * 2 + ds.typography.headline.lineHeight;
};

export const AnimatedHeader = ({title, scrollValue, rightAction, children}: AnimatedHeaderProps) => {
  const {ds, theme, scheme} = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(ds, theme);

  const topPadding =
    Platform.OS === 'android'
      ? (StatusBar.currentHeight ?? 0) + ds.spacing.lg
      : Platform.OS === 'ios'
        ? ds.spacing.md
        : ds.spacing.xl;

  const headerOpacity = useDerivedValue(() => {
    return withTiming(scrollValue.value > 10 ? 1 : 0, {duration: 200});
  }, []);

  const blurStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const headerStyle = useAnimatedStyle(() => ({
    borderBottomWidth: 1,
    borderBottomColor: interpolateColor(
      headerOpacity.value,
      [0, 1],
      ['transparent', scheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'],
    ),
  }));

  const headerContent = (
    <>
      <View style={styles.leftSpacer} />
      <View style={styles.centerContent}>
        {title && <ThemedText style={styles.headerTitle}>{title}</ThemedText>}
        {children}
      </View>
      <View style={styles.rightActionContainer}>{rightAction}</View>
    </>
  );

  return (
    <View style={styles.absoluteTop}>
      {/* Blur background */}
      <Animated.View style={[styles.headerBlur, blurStyle]}>
        <BlurView
          intensity={40}
          tint={scheme === 'dark' ? 'dark' : 'light'}
          style={[styles.blurContainer, {height: topPadding + ds.spacing.md * 2 + ds.typography.headline.lineHeight}]}
        />
      </Animated.View>

      {/* Border container - separate from blur */}
      <Animated.View
        style={[
          styles.borderContainer,
          headerStyle,
          {height: topPadding + ds.spacing.md * 2 + ds.typography.headline.lineHeight},
        ]}
      />

      <View
        style={[
          styles.headerContent,
          {
            height: topPadding + ds.spacing.md * 2 + ds.typography.headline.lineHeight,
            paddingTop: topPadding,
          },
        ]}>
        <View style={styles.headerContentWrapper}>{headerContent}</View>
      </View>
    </View>
  );
};

const createStyles = (ds: typeof DesignSystem, theme: typeof Tokens.light | typeof Tokens.dark) =>
  StyleSheet.create({
    absoluteTop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1,
    },
    headerBlur: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
    },
    blurContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
    },
    borderContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
    },
    headerContent: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      paddingHorizontal: ds.spacing.xl,
    },
    headerContentWrapper: {
      flex: 1,
      paddingBottom: ds.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    leftSpacer: {
      width: ds.iconSize.lg,
    },
    centerContent: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      ...ds.typography.headline,
      fontWeight: ds.fontWeight.bold,
    },
    rightActionContainer: {
      width: ds.iconSize.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
