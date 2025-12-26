import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import {onlineManager} from '@tanstack/react-query';
import {
  useBackendReachability,
  type ReachabilityOptions,
} from './hooks/use-backend-reachability';
import {useNetInfoStatus} from './hooks/use-netinfo-status';
import {useOfflineReminderEmitter} from './hooks/use-offline-reminder';
import type {NetInfoState} from '@react-native-community/netinfo';

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
  const status = useNetInfoStatus();
  const {offlineReminderSignal, triggerOfflineReminder, notifyOfflineState} =
    useOfflineReminderEmitter();
  const {reachability, checkBackendReachability, refreshBackendReachability} =
    useBackendReachability(status, triggerOfflineReminder);

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

  useEffect(() => {
    notifyOfflineState(isDeviceOffline);
  }, [isDeviceOffline, notifyOfflineState]);

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
