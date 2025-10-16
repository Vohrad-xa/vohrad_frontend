import type {PropsWithChildren, ReactElement} from 'react';
import {StyleSheet, Platform} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollOffset,
} from 'react-native-reanimated';

import {ThemedView} from '@/components/ui';
import type {ColorScheme} from '@/constants/colors';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';

const HEADER_HEIGHT = 250;

type Props = PropsWithChildren<{
  headerImage: ReactElement;
  headerBackgroundColor: {dark: string; light: string};
}>;

export default function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor,
}: Props) {
  const {scheme: colorScheme, ds, theme} = useTheme();
  const styles = createStyles(ds, theme, colorScheme, headerBackgroundColor);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollOffset(scrollRef);
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75],
          ),
        },
        {
          scale: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [2, 1, 1],
          ),
        },
      ],
    };
  });

  return (
    <Animated.ScrollView
      ref={scrollRef}
      style={styles.scrollView}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={Platform.OS === 'web'}
      showsHorizontalScrollIndicator={Platform.OS === 'web'}
    >
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        {headerImage}
      </Animated.View>
      <ThemedView style={styles.content}>{children}</ThemedView>
    </Animated.ScrollView>
  );
}

const createStyles = makeStyleFactory(
  (
    ds: DSShape,
    theme: ThemeShape,
    colorScheme: ColorScheme,
    headerBackgroundColor: {dark: string; light: string},
  ) =>
    StyleSheet.create({
      scrollView: {
        backgroundColor: theme.background,
        flex: 1,
      },
      header: {
        height: HEADER_HEIGHT,
        overflow: 'hidden',
        backgroundColor: headerBackgroundColor[colorScheme],
      },
      content: {
        flex: 1,
        padding: ds.spacing.xxl,
        gap: ds.spacing.lg,
        overflow: 'hidden',
      },
    }),
  (ds, theme, colorScheme, headerBackgroundColor) =>
    `${themeKey(theme, ds)}|${headerBackgroundColor.dark}|${headerBackgroundColor.light}|${colorScheme}`,
);
