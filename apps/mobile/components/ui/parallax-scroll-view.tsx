import type {PropsWithChildren, ReactElement} from 'react';
import {StyleSheet, Platform} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollOffset,
} from 'react-native-reanimated';

import {ThemedView} from '@/components/ui';
import {useTheme} from '@/providers';

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
  const backgroundColor = theme.background;
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

  const styles = StyleSheet.create({
    header: {
      height: HEADER_HEIGHT,
      overflow: 'hidden',
    },
    content: {
      flex: 1,
      padding: ds.spacing.xxl,
      gap: ds.spacing.lg,
      overflow: 'hidden',
    },
  });

  return (
    <Animated.ScrollView
      ref={scrollRef}
      style={{backgroundColor, flex: 1}}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={Platform.OS === 'web'}
      showsHorizontalScrollIndicator={Platform.OS === 'web'}
    >
      <Animated.View
        style={[
          styles.header,
          {backgroundColor: headerBackgroundColor[colorScheme]},
          headerAnimatedStyle,
        ]}
      >
        {headerImage}
      </Animated.View>
      <ThemedView style={styles.content}>{children}</ThemedView>
    </Animated.ScrollView>
  );
}
