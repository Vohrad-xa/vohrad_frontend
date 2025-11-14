import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {Platform} from 'react-native';
import {onlineManager} from '@tanstack/react-query';
import {verifyNetworkReachability} from '@vohrad/api-client';
import * as Network from 'expo-network';

const BACKEND_REACHABILITY_TIMEOUT_MS = 3000;
const REACHABILITY_CACHE_WINDOW_MS = 10000;

type ConnectivitySnapshot = {
  type: Network.NetworkStateType;
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
};

type ReachabilityState = {
  lastCheckAt: number | null;
  lastResult: boolean | null;
  isChecking: boolean;
};

type ReachabilityOptions = {
  force?: boolean;
  timeoutMs?: number;
};

type NetworkContextValue = {
  status: ConnectivitySnapshot;
  networkType: Network.NetworkStateType;
  isConnected: boolean;
  isInternetReachable: boolean;
  isCheckingReachability: boolean;
  lastReachabilityResult: boolean | null;
  lastReachabilityCheckAt: number | null;
  isNetworkReady: boolean;
  isOffline: boolean;
  refreshBackendReachability: () => Promise<boolean>;
  checkBackendReachability: (options?: ReachabilityOptions) => Promise<boolean>;
};

const NetworkContext = createContext<NetworkContextValue | undefined>(
  undefined,
);

export function NetworkProvider({children}: {children: ReactNode}) {
  const [status, setStatus] = useState<ConnectivitySnapshot>({
    type: Network.NetworkStateType.UNKNOWN,
    isConnected: null,
    isInternetReachable: null,
  });
  const [reachability, setReachability] = useState<ReachabilityState>({
    lastCheckAt: null,
    lastResult: null,
    isChecking: false,
  });

  useEffect(() => {
    if (Platform.OS === 'web') {
      const syncFromNavigator = () => {
        const online = getNavigatorOnlineStatus();
        setStatus({
          type: Network.NetworkStateType.UNKNOWN,
          isConnected: online,
          isInternetReachable: online,
        });
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

    let isMounted = true;

    const syncState = (state: Network.NetworkState | null) => {
      if (!state || !isMounted) {
        return;
      }
      setStatus({
        type: state.type ?? Network.NetworkStateType.UNKNOWN,
        isConnected:
          typeof state.isConnected === 'boolean' ? state.isConnected : null,
        isInternetReachable:
          typeof state.isInternetReachable === 'boolean'
            ? state.isInternetReachable
            : null,
      });
    };

    Network.getNetworkStateAsync()
      .then((initialState) => {
        syncState(initialState);
      })
      .catch((error) => {
        console.warn('NetworkProvider: failed to fetch initial state', error);
      });

    const subscription =
      typeof Network.addNetworkStateListener === 'function'
        ? Network.addNetworkStateListener(
            (networkState: Network.NetworkState) => syncState(networkState),
          )
        : null;

    return () => {
      isMounted = false;
      subscription?.remove();
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
        return isOnline;
      }

      const lacksConnectivity =
        status.isConnected === false || status.isInternetReachable === false;

      if (lacksConnectivity) {
        setReachability({
          lastCheckAt: now,
          lastResult: false,
          isChecking: false,
        });
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
        return reachable;
      } catch (error) {
        console.warn('NetworkProvider: reachability check failed', error);
        setReachability({
          lastCheckAt: Date.now(),
          lastResult: false,
          isChecking: false,
        });
        return false;
      }
    },
    [
      status.isConnected,
      status.isInternetReachable,
      reachability.lastCheckAt,
      reachability.lastResult,
    ],
  );

  const refreshBackendReachability = useCallback(() => {
    return checkBackendReachability({force: true});
  }, [checkBackendReachability]);

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

    const shouldCheckBackend =
      status.isConnected === true && status.isInternetReachable !== false;

    if (shouldCheckBackend) {
      void refreshBackendReachability();
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
  }, [
    refreshBackendReachability,
    status.isConnected,
    status.isInternetReachable,
  ]);

  const normalizedConnection =
    typeof status.isConnected === 'boolean' ? status.isConnected : true;
  const normalizedInternet =
    typeof status.isInternetReachable === 'boolean'
      ? status.isInternetReachable
      : normalizedConnection;
  const backendReachability =
    typeof reachability.lastResult === 'boolean'
      ? reachability.lastResult
      : true;
  const isNetworkReady = normalizedInternet && backendReachability;
  const isOffline = !isNetworkReady;

  useEffect(() => {
    onlineManager.setOnline(isNetworkReady);
  }, [isNetworkReady]);

  const value = useMemo<NetworkContextValue>(
    () => ({
      status,
      networkType: status.type,
      isConnected: normalizedConnection,
      isInternetReachable: normalizedInternet,
      isCheckingReachability: reachability.isChecking,
      lastReachabilityResult: reachability.lastResult,
      lastReachabilityCheckAt: reachability.lastCheckAt,
      isNetworkReady,
      isOffline,
      refreshBackendReachability,
      checkBackendReachability,
    }),
    [
      status,
      normalizedConnection,
      normalizedInternet,
      reachability.isChecking,
      reachability.lastResult,
      reachability.lastCheckAt,
      isNetworkReady,
      isOffline,
      refreshBackendReachability,
      checkBackendReachability,
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
