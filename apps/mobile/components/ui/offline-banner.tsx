import React, {useEffect, useRef, useState} from 'react';
import {ActivityIndicator, Animated, Platform, StatusBar} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {themeKey, type DSShape, type ThemeShape, Palette} from '@/constants';
import {useNetworkConnectivity, useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';
import {ThemedText, ThemedView} from './themed-components';

const ANIMATION_DURATION = 200;
const ONLINE_MESSAGE_DURATION_MS = 3000;
type BannerTone = 'offline' | 'online';

export function OfflineBanner() {
  const {isDeviceOffline, refreshBackendReachability} =
    useNetworkConnectivity();
  const {theme, ds} = useTheme();
  const insets = useSafeAreaInsets();
  const [showOnlineMessage, setShowOnlineMessage] = useState(false);
  const shouldDisplayBanner = isDeviceOffline || showOnlineMessage;
  const [visible, setVisible] = useState(false);
  const [progress] = useState(new Animated.Value(0));
  const latestShouldDisplayRef = useRef(shouldDisplayBanner);
  const previousIsOfflineRef = useRef(isDeviceOffline);
  const refreshReachabilityRef = useRef(refreshBackendReachability);

  const topPadding =
    Platform.OS === 'web'
      ? ds.spacing.lg
      : Platform.OS === 'android'
        ? (StatusBar.currentHeight ?? 0) + ds.spacing.lg
        : Math.max(insets.top, ds.spacing.xl);

  const styles = useStyles(theme, ds, topPadding);

  const activeTone: BannerTone | null = !visible
    ? null
    : isDeviceOffline
      ? 'offline'
      : 'online';

  useEffect(() => {
    refreshReachabilityRef.current = refreshBackendReachability;
  }, [refreshBackendReachability]);

  useEffect(() => {
    latestShouldDisplayRef.current = shouldDisplayBanner;
  }, [shouldDisplayBanner]);

  useEffect(() => {
    const wasOffline = previousIsOfflineRef.current;
    previousIsOfflineRef.current = isDeviceOffline;

    if (wasOffline && !isDeviceOffline) {
      setShowOnlineMessage(true);
      const timeout = setTimeout(() => {
        setShowOnlineMessage(false);
      }, ONLINE_MESSAGE_DURATION_MS);
      return () => clearTimeout(timeout);
    }

    if (isDeviceOffline) {
      setShowOnlineMessage(false);
    }
    return undefined;
  }, [isDeviceOffline]);

  useEffect(() => {
    if (!isDeviceOffline) {
      return undefined;
    }

    const checkReachability = () => {
      refreshReachabilityRef.current?.();
    };

    checkReachability();
    const interval = setInterval(checkReachability, 5000);
    return () => clearInterval(interval);
  }, [isDeviceOffline]);

  useEffect(() => {
    if (shouldDisplayBanner) {
      setVisible(true);
    }

    Animated.timing(progress, {
      toValue: shouldDisplayBanner ? 1 : 0,
      duration: ANIMATION_DURATION,
      useNativeDriver: true,
    }).start(({finished}) => {
      if (finished && !latestShouldDisplayRef.current) {
        setVisible(false);
      }
    });
  }, [progress, shouldDisplayBanner]);

  if (!visible) {
    return null;
  }

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 0],
  });

  const opacity = progress;
  const message =
    activeTone === 'online' ? "You're back online" : 'You seem to be offline.';

  const showOfflineSpinner = isDeviceOffline && !showOnlineMessage;

  const bannerToneStyle =
    activeTone === 'online' ? styles.bannerOnline : styles.bannerOffline;

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
        {showOfflineSpinner && (
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
      backgroundColor: theme.destructive,
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
