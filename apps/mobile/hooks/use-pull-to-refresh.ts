import React, {useCallback, useMemo, useState} from 'react';
import {Platform, RefreshControl, type RefreshControlProps} from 'react-native';
import {useHaptic, useLoading} from '@/providers';

interface PullToRefreshOptions {
  onRefresh?: () => void | Promise<void>;
  minDelayMs?: number;
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
  const {triggerHaptic} = useHaptic();
  const {forceLoading} = useLoading();
  const {onRefresh, minDelayMs = 300} = options;
  const [refreshing, setRefreshing] = useState(false);

  // Keep spinner active while forceLoading is true
  const isActivelyRefreshing = refreshing || forceLoading;

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
      const remainingTime = minDelayMs - elapsed;

      if (remainingTime > 0) {
        await wait(remainingTime);
      }
    } catch (_error) {
      didError = true;
    } finally {
      triggerHaptic(didError ? 'warning' : 'success');
      setRefreshing(false);
    }
  }, [refreshing, onRefresh, minDelayMs, triggerHaptic]);

  const refreshControl = useMemo(() => {
    if (Platform.OS === 'web') {
      return undefined;
    }

    return React.createElement(RefreshControl, {
      refreshing: isActivelyRefreshing,
      onRefresh: handleRefresh,
    }) as React.ReactElement<RefreshControlProps>;
  }, [handleRefresh, isActivelyRefreshing]);

  return {
    refreshing: isActivelyRefreshing,
    onRefresh: handleRefresh,
    refreshControl,
  };
}
