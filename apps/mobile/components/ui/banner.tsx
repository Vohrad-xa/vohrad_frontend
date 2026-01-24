import React, {useEffect, useRef, useState} from 'react';
import {ActivityIndicator, Animated, Platform, StatusBar} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {themeKey, type DSShape, type ThemeShape, Palette} from '@/constants';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';
import {ThemedText, ThemedView} from './themed-components';

export type Banner = 'offline' | 'online';

type OfflineBannerProps = {
  isVisible: boolean;
  tone: Banner;
  message: string;
  showSpinner?: boolean;
};

export function BannerTop({
  isVisible,
  tone,
  message,
  showSpinner = false,
}: OfflineBannerProps) {
  const {theme, ds} = useTheme();
  const insets = useSafeAreaInsets();
  const [progress] = useState(new Animated.Value(isVisible ? 1 : 0));
  const [internalVisible, setInternalVisible] = useState(isVisible);
  const latestVisibilityRef = useRef(isVisible);
  const [displayTone, setDisplayTone] = useState<Banner>(tone);

  const topPadding =
    Platform.OS === 'web'
      ? ds.spacing.lg
      : Platform.OS === 'android'
        ? (StatusBar.currentHeight ?? 0) + ds.spacing.lg
        : Math.max(insets.top, ds.spacing.xl);

  const styles = useStyles(theme, ds, topPadding);

  useEffect(() => {
    latestVisibilityRef.current = isVisible;
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) {
      setInternalVisible(true);
      setDisplayTone(tone);
    }
  }, [isVisible, tone]);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: isVisible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start(({finished}) => {
      if (finished && !latestVisibilityRef.current) {
        setInternalVisible(false);
      }
    });
  }, [isVisible, progress]);

  if (!internalVisible) {
    return null;
  }

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 0],
  });

  const opacity = progress;
  const bannerToneStyle =
    displayTone === 'online' ? styles.bannerOnline : styles.bannerOffline;
  const shouldShowSpinner = showSpinner && displayTone === 'offline';

  return (
    <Animated.View
      style={[
        styles.container,
        styles.banner,
        bannerToneStyle,
        {
          transform: [{translateY}],
          opacity,
        },
      ]}
    >
      <ThemedView style={styles.content}>
        {shouldShowSpinner && (
          <ActivityIndicator
            size="small"
            color={Palette.white}
            style={styles.spinner}
          />
        )}
        <ThemedText variant="body" style={styles.text}>
          {message}
        </ThemedText>
      </ThemedView>
    </Animated.View>
  );
}

const useStyles = makeStyleFactory(
  (theme: ThemeShape, ds: DSShape, topPadding: number) => ({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
    },
    banner: {
      paddingTop: topPadding,
      paddingBottom: ds.spacing.sm,
      minHeight: topPadding + ds.spacing.xxxl + ds.spacing.xs,
    },
    bannerOnline: {
      backgroundColor: theme.accentGreen,
    },
    bannerOffline: {
      backgroundColor: theme.accentRed,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: ds.spacing.xxl,
    },
    spinner: {
      marginRight: ds.spacing.sm,
    },
    text: {
      color: Palette.white,
      fontWeight: ds.fontWeight.medium,
    },
  }),
  (theme, ds, topPadding) => `${themeKey(theme, ds)}|${topPadding}`,
);
