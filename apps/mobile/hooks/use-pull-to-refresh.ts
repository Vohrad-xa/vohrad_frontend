import React, {useCallback, useMemo, useState} from 'react';
import {Platform, RefreshControl, type RefreshControlProps} from 'react-native';
import {useHaptic, useTheme} from '@/providers';

interface PullToRefreshOptions {
  onRefresh?: () => void | Promise<void>;
  delayMs?: number;
  tintColor?: RefreshControlProps['tintColor'];
  progressBackgroundColor?: RefreshControlProps['progressBackgroundColor'];
  androidColors?: RefreshControlProps['colors'];
}

interface PullToRefreshResult {
  refreshing: boolean;
  onRefresh: () => Promise<void>;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export function usePullToRefresh(
  options: PullToRefreshOptions = {},
): PullToRefreshResult {
  const {theme} = useTheme();
  const {triggerHaptic} = useHaptic();
  const {
    onRefresh,
    delayMs = 800,
    tintColor,
    progressBackgroundColor,
    androidColors,
  } = options;
  const [refreshing, setRefreshing] = useState(false);

  const resolvedTintColor = tintColor ?? theme.tint;
  const resolvedProgressBackgroundColor =
    progressBackgroundColor ??
    (Platform.OS === 'android' ? theme.surface : theme.card);

  const handleRefresh = useCallback(async () => {
    if (refreshing) {
      return;
    }

    triggerHaptic('light');
    setRefreshing(true);
    const startTime = Date.now();
    let didError = false;

    try {
      if (onRefresh) {
        await onRefresh();
      }

      const elapsed = Date.now() - startTime;
      const remainingTime = delayMs - elapsed;

      if (remainingTime > 0) {
        await wait(remainingTime);
      }
    } catch (error) {
      didError = true;
      throw error;
    } finally {
      triggerHaptic(didError ? 'warning' : 'success');
      setRefreshing(false);
    }
  }, [refreshing, onRefresh, delayMs, triggerHaptic]);

  const refreshControl = useMemo(() => {
    if (Platform.OS === 'web') {
      return undefined;
    }

    const resolvedAndroidColors = androidColors ?? [theme.tint];

    return React.createElement(RefreshControl, {
      refreshing,
      onRefresh: handleRefresh,
      tintColor: resolvedTintColor,
      progressBackgroundColor: resolvedProgressBackgroundColor,
      colors: resolvedAndroidColors,
    }) as React.ReactElement<RefreshControlProps>;
  }, [
    handleRefresh,
    refreshing,
    resolvedProgressBackgroundColor,
    resolvedTintColor,
    androidColors,
    theme.tint,
  ]);

  return {refreshing, onRefresh: handleRefresh, refreshControl};
}
