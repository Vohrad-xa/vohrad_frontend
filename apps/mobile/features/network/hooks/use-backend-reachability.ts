import {useCallback, useEffect, useRef, useState} from 'react';
import {Platform} from 'react-native';
import {type NetInfoState} from '@react-native-community/netinfo';
import {verifyNetworkReachability} from '@sykamore/api-client';
import {
  BACKEND_REACHABILITY_TIMEOUT_MS,
  REACHABILITY_CACHE_WINDOW_MS,
} from '../constants';
import {getNavigatorOnlineStatus} from '../utils';

export type ReachabilityOptions = {
  force?: boolean;
  timeoutMs?: number;
  remindOffline?: boolean;
};

export type ReachabilityState = {
  lastCheckAt: number | null;
  lastResult: boolean | null;
  isChecking: boolean;
};

export function useBackendReachability(
  status: NetInfoState | null,
  triggerOfflineReminder: () => void,
) {
  const [reachability, setReachability] = useState<ReachabilityState>({
    lastCheckAt: null,
    lastResult: null,
    isChecking: false,
  });

  const checkBackendReachability = useCallback(
    async (options?: ReachabilityOptions) => {
      const now = Date.now();

      if (Platform.OS === 'web') {
        const isOnline = getNavigatorOnlineStatus();
        setReachability({
          lastCheckAt: now,
          lastResult: isOnline,
          isChecking: false,
        });
        if (!isOnline && options?.remindOffline) {
          triggerOfflineReminder();
        }
        return isOnline;
      }

      const lacksConnectivity =
        status?.isConnected === false || status?.isInternetReachable === false;

      if (lacksConnectivity) {
        setReachability({
          lastCheckAt: now,
          lastResult: false,
          isChecking: false,
        });
        if (options?.remindOffline) {
          triggerOfflineReminder();
        }
        return false;
      }

      const withinCacheWindow =
        !options?.force &&
        reachability.lastCheckAt !== null &&
        now - reachability.lastCheckAt < REACHABILITY_CACHE_WINDOW_MS &&
        typeof reachability.lastResult === 'boolean';

      if (withinCacheWindow) {
        return reachability.lastResult as boolean;
      }

      setReachability((prev) => ({...prev, isChecking: true}));

      try {
        const reachable = await verifyNetworkReachability({
          timeoutMs: options?.timeoutMs ?? BACKEND_REACHABILITY_TIMEOUT_MS,
        });

        setReachability({
          lastCheckAt: Date.now(),
          lastResult: reachable,
          isChecking: false,
        });
        if (!reachable && options?.remindOffline) {
          triggerOfflineReminder();
        }
        return reachable;
      } catch (error) {
        console.warn(
          'useBackendReachability: reachability check failed',
          error,
        );
        setReachability({
          lastCheckAt: Date.now(),
          lastResult: false,
          isChecking: false,
        });
        if (options?.remindOffline) {
          triggerOfflineReminder();
        }
        return false;
      }
    },
    [
      status,
      reachability.lastCheckAt,
      reachability.lastResult,
      triggerOfflineReminder,
    ],
  );

  const refreshBackendReachability = useCallback(() => {
    return checkBackendReachability({force: true});
  }, [checkBackendReachability]);

  const refreshBackendReachabilityRef = useRef(refreshBackendReachability);
  useEffect(() => {
    refreshBackendReachabilityRef.current = refreshBackendReachability;
  }, [refreshBackendReachability]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const online = getNavigatorOnlineStatus();
      setReachability({
        lastCheckAt: Date.now(),
        lastResult: online,
        isChecking: false,
      });
      return;
    }

    if (!status) {
      return;
    }

    const shouldCheckBackend =
      status.isConnected === true && status.isInternetReachable !== false;

    if (shouldCheckBackend) {
      refreshBackendReachabilityRef.current?.();
      return;
    }

    const shouldMarkOffline =
      status.isConnected === false || status.isInternetReachable === false;

    if (shouldMarkOffline) {
      setReachability((prev) => {
        if (prev.lastResult === false && prev.isChecking === false) {
          return prev;
        }
        return {
          lastCheckAt: Date.now(),
          lastResult: false,
          isChecking: false,
        };
      });
    }
  }, [status]);

  return {
    reachability,
    checkBackendReachability,
    refreshBackendReachability,
  };
}
