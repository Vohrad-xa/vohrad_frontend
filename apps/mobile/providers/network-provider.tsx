import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {Platform} from 'react-native';
import NetInfo, {
  type NetInfoState,
  NetInfoStateType,
} from '@react-native-community/netinfo';
import {onlineManager} from '@tanstack/react-query';
import {verifyNetworkReachability} from '@vohrad/api-client';

const BACKEND_REACHABILITY_TIMEOUT_MS = 3000;
const REACHABILITY_CACHE_WINDOW_MS = 10000;

type ReachabilityState = {
  lastCheckAt: number | null;
  lastResult: boolean | null;
  isChecking: boolean;
};

type ReachabilityOptions = {
  force?: boolean;
  timeoutMs?: number;
  remindOffline?: boolean;
};

type NetworkContextValue = {
  status: NetInfoState | null;
  networkType: string;
  isConnected: boolean;
  isInternetReachable: boolean;
  hasDeviceConnectivity: boolean;
  isDeviceOffline: boolean;
  isCheckingReachability: boolean;
  lastReachabilityResult: boolean | null;
  lastReachabilityCheckAt: number | null;
  isNetworkReady: boolean;
  isOffline: boolean;
  refreshBackendReachability: () => Promise<boolean>;
  checkBackendReachability: (options?: ReachabilityOptions) => Promise<boolean>;
  offlineReminderSignal: number;
  triggerOfflineReminder: () => void;
};

const NetworkContext = createContext<NetworkContextValue | undefined>(
  undefined,
);

export function NetworkProvider({children}: {children: ReactNode}) {
  const [status, setStatus] = useState<NetInfoState | null>(null);
  const [reachability, setReachability] = useState<ReachabilityState>({
    lastCheckAt: null,
    lastResult: null,
    isChecking: false,
  });
  const [offlineReminderSignal, setOfflineReminderSignal] = useState(0);

  const triggerOfflineReminder = useCallback(() => {
    setOfflineReminderSignal((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const syncFromNavigator = () => {
        const online = getNavigatorOnlineStatus();
        setStatus({
          type: NetInfoStateType.unknown,
          isConnected: online,
          isInternetReachable: null,
          details: null,
        } as NetInfoState);
      };

      syncFromNavigator();
      const globalTarget = globalThis as typeof globalThis & {
        addEventListener?: (type: string, listener: () => void) => void;
        removeEventListener?: (type: string, listener: () => void) => void;
      };
      globalTarget.addEventListener?.('online', syncFromNavigator);
      globalTarget.addEventListener?.('offline', syncFromNavigator);
      return () => {
        globalTarget.removeEventListener?.('online', syncFromNavigator);
        globalTarget.removeEventListener?.('offline', syncFromNavigator);
      };
    }

    NetInfo.fetch()
      .then((state) => {
        setStatus(state);
      })
      .catch((error) => {
        console.warn('NetworkProvider: failed to fetch initial state', error);
      });

    const unsubscribe = NetInfo.addEventListener((state) => {
      setStatus(state);
    });

    return () => {
      unsubscribe();
    };
  }, []);

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
        console.warn('NetworkProvider: reachability check failed', error);
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

  const isInitializing = status === null;
  const normalizedConnection = status?.isConnected === true;
  const normalizedInternet =
    status?.isInternetReachable === true ||
    (status?.isInternetReachable === null && normalizedConnection);
  const hasDeviceConnectivity = isInitializing ? true : normalizedInternet;
  const isDeviceOffline = isInitializing ? false : !hasDeviceConnectivity;
  const backendReachability =
    typeof reachability.lastResult === 'boolean'
      ? reachability.lastResult
      : hasDeviceConnectivity;
  const isNetworkReady = hasDeviceConnectivity && backendReachability;
  const isOffline = !isNetworkReady;

  useEffect(() => {
    onlineManager.setOnline(isNetworkReady);
  }, [isNetworkReady]);

  const wasDeviceOfflineRef = useRef(isDeviceOffline);
  useEffect(() => {
    const wasOffline = wasDeviceOfflineRef.current;
    wasDeviceOfflineRef.current = isDeviceOffline;

    if (isDeviceOffline && !wasOffline) {
      triggerOfflineReminder();
    }
  }, [isDeviceOffline, triggerOfflineReminder]);

  const value = useMemo<NetworkContextValue>(
    () => ({
      status,
      networkType: status?.type ?? 'unknown',
      isConnected: normalizedConnection,
      isInternetReachable: normalizedInternet,
      hasDeviceConnectivity,
      isDeviceOffline,
      isCheckingReachability: reachability.isChecking,
      lastReachabilityResult: reachability.lastResult,
      lastReachabilityCheckAt: reachability.lastCheckAt,
      isNetworkReady,
      isOffline,
      refreshBackendReachability,
      checkBackendReachability,
      offlineReminderSignal,
      triggerOfflineReminder,
    }),
    [
      status,
      normalizedConnection,
      normalizedInternet,
      reachability.isChecking,
      reachability.lastResult,
      reachability.lastCheckAt,
      hasDeviceConnectivity,
      isDeviceOffline,
      isNetworkReady,
      isOffline,
      refreshBackendReachability,
      checkBackendReachability,
      offlineReminderSignal,
      triggerOfflineReminder,
    ],
  );

  return (
    <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
  );
}

export function useNetworkConnectivity(): NetworkContextValue {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error(
      'useNetworkConnectivity must be used within a NetworkProvider',
    );
  }
  return context;
}

function getNavigatorOnlineStatus(): boolean {
  const nav = (globalThis as {navigator?: {onLine?: boolean}}).navigator;
  if (typeof nav?.onLine === 'boolean') {
    return nav.onLine;
  }
  return true;
}
