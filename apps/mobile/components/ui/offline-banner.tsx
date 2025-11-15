import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ActivityIndicator, Animated, Platform, StatusBar} from 'react-native';
import {useSegments} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {themeKey, type DSShape, type ThemeShape, Palette} from '@/constants';
import {useNetworkConnectivity, useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';
import {ThemedText, ThemedView} from './themed-components';

const ANIMATION_DURATION = 200;
const ONLINE_MESSAGE_DURATION_MS = 3000;
const OFFLINE_MESSAGE_DURATION_MS = 4000;
type BannerTone = 'offline' | 'online';

export function OfflineBanner() {
  const {isDeviceOffline, refreshBackendReachability, offlineReminderSignal} =
    useNetworkConnectivity();
  const {theme, ds} = useTheme();
  const insets = useSafeAreaInsets();
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);
  const [showOnlineMessage, setShowOnlineMessage] = useState(false);
  const shouldDisplayBanner = showOfflineMessage || showOnlineMessage;
  const [visible, setVisible] = useState(false);
  const [progress] = useState(new Animated.Value(0));
  const latestShouldDisplayRef = useRef(shouldDisplayBanner);
  const previousIsOfflineRef = useRef(isDeviceOffline);
  const refreshReachabilityRef = useRef(refreshBackendReachability);
  const offlineReminderRef = useRef(offlineReminderSignal);
  const offlineMessageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const onlineMessageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const segments = useSegments();
  const routeFingerprint = segments.join('/');
  const lastRouteFingerprintRef = useRef(routeFingerprint);

  const topPadding =
    Platform.OS === 'web'
      ? ds.spacing.lg
      : Platform.OS === 'android'
        ? (StatusBar.currentHeight ?? 0) + ds.spacing.lg
        : Math.max(insets.top, ds.spacing.xl);

  const styles = useStyles(theme, ds, topPadding);

  const activeTone: BannerTone | null = !visible
    ? null
    : showOfflineMessage && isDeviceOffline
      ? 'offline'
      : showOnlineMessage
        ? 'online'
        : null;
  const [displayTone, setDisplayTone] = useState<BannerTone>('offline');

  useEffect(() => {
    if (activeTone) {
      setDisplayTone(activeTone);
    }
  }, [activeTone]);

  useEffect(() => {
    refreshReachabilityRef.current = refreshBackendReachability;
  }, [refreshBackendReachability]);

  useEffect(() => {
    latestShouldDisplayRef.current = shouldDisplayBanner;
  }, [shouldDisplayBanner]);

  const showOfflineReminder = useCallback(() => {
    if (!isDeviceOffline) {
      return;
    }

    setShowOfflineMessage(true);
    if (offlineMessageTimeoutRef.current) {
      clearTimeout(offlineMessageTimeoutRef.current);
    }
    offlineMessageTimeoutRef.current = setTimeout(() => {
      setShowOfflineMessage(false);
      offlineMessageTimeoutRef.current = null;
    }, OFFLINE_MESSAGE_DURATION_MS);
  }, [isDeviceOffline]);

  useEffect(() => {
    if (routeFingerprint === lastRouteFingerprintRef.current) {
      return;
    }

    lastRouteFingerprintRef.current = routeFingerprint;

    if (isDeviceOffline) {
      showOfflineReminder();
    }
  }, [isDeviceOffline, routeFingerprint, showOfflineReminder]);

  useEffect(() => {
    if (offlineReminderSignal === offlineReminderRef.current) {
      return;
    }

    offlineReminderRef.current = offlineReminderSignal;

    showOfflineReminder();
  }, [offlineReminderSignal, showOfflineReminder]);

  useEffect(() => {
    const wasOffline = previousIsOfflineRef.current;
    previousIsOfflineRef.current = isDeviceOffline;

    if (wasOffline && !isDeviceOffline) {
      if (offlineMessageTimeoutRef.current) {
        clearTimeout(offlineMessageTimeoutRef.current);
        offlineMessageTimeoutRef.current = null;
      }
      setShowOfflineMessage(false);
      setShowOnlineMessage(true);
      if (onlineMessageTimeoutRef.current) {
        clearTimeout(onlineMessageTimeoutRef.current);
      }
      onlineMessageTimeoutRef.current = setTimeout(() => {
        setShowOnlineMessage(false);
        onlineMessageTimeoutRef.current = null;
      }, ONLINE_MESSAGE_DURATION_MS);
      return undefined;
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
    return () => {
      if (offlineMessageTimeoutRef.current) {
        clearTimeout(offlineMessageTimeoutRef.current);
      }
      if (onlineMessageTimeoutRef.current) {
        clearTimeout(onlineMessageTimeoutRef.current);
      }
    };
  }, []);

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
    displayTone === 'online' ? "You're back online" : 'You seem to be offline.';

  const showOfflineSpinner = displayTone === 'offline';

  const bannerToneStyle =
    displayTone === 'online' ? styles.bannerOnline : styles.bannerOffline;

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
      paddingBottom: ds.spacing.md,
      minHeight: topPadding,
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
