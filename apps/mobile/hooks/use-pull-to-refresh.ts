import React, {useCallback, useMemo, useState} from 'react';
import {Platform, RefreshControl, type RefreshControlProps} from 'react-native';
import {useNetworkConnectivity} from '@/modules/network';
import {useHaptic} from '@/providers';

interface PullToRefreshOptions {
  onRefresh?: () => void | Promise<void>;
  minDelayMs?: number;
  requireNetwork?: boolean;
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
  const {isDeviceOffline} = useNetworkConnectivity();
  const {onRefresh, minDelayMs = 300, requireNetwork = true} = options;
  const [refreshing, setRefreshing] = useState(false);
  const shouldEnableRefreshControl = !requireNetwork || !isDeviceOffline;

  const handleRefresh = useCallback(async () => {
    if (refreshing) {
      return;
    }

    if (!shouldEnableRefreshControl) {
      triggerHaptic('warning');
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
  }, [
    refreshing,
    shouldEnableRefreshControl,
    onRefresh,
    minDelayMs,
    triggerHaptic,
  ]);

  const refreshControl = useMemo(() => {
    if (Platform.OS === 'web' || !shouldEnableRefreshControl) {
      return undefined;
    }

    return React.createElement(RefreshControl, {
      refreshing,
      onRefresh: handleRefresh,
    }) as React.ReactElement<RefreshControlProps>;
  }, [handleRefresh, refreshing, shouldEnableRefreshControl]);

  return {
    refreshing,
    onRefresh: handleRefresh,
    refreshControl,
  };
}
