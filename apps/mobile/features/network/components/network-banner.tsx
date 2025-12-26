import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useSegments} from 'expo-router';
import {BannerTop, type Banner} from '@/components/ui';
import {
  OFFLINE_MESSAGE_DURATION_MS,
  ONLINE_MESSAGE_DURATION_MS,
  RECONNECT_POLL_INTERVAL_MS,
  ONLINE_MESSAGE,
  OFFLINE_MESSAGE,
} from '../constants';
import {useNetworkConnectivity} from '../context';

export function NetworkBanner() {
  const {isDeviceOffline, refreshBackendReachability, offlineReminderSignal} =
    useNetworkConnectivity();
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);
  const [showOnlineMessage, setShowOnlineMessage] = useState(false);
  const segments = useSegments();
  const routeFingerprint = useMemo(() => segments.join('/'), [segments]);

  const refreshReachabilityRef = useRef(refreshBackendReachability);
  const offlineReminderRef = useRef(offlineReminderSignal);
  const previousIsOfflineRef = useRef(isDeviceOffline);
  const offlineMessageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const onlineMessageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const lastRouteFingerprintRef = useRef(routeFingerprint);

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
    refreshReachabilityRef.current = refreshBackendReachability;
  }, [refreshBackendReachability]);

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
      return;
    }

    if (isDeviceOffline) {
      setShowOnlineMessage(false);
    }
  }, [isDeviceOffline]);

  useEffect(() => {
    if (!isDeviceOffline) {
      return undefined;
    }

    const checkReachability = () => {
      refreshReachabilityRef.current?.();
    };

    checkReachability();
    const interval = setInterval(checkReachability, RECONNECT_POLL_INTERVAL_MS);
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

  const isVisible = showOfflineMessage || showOnlineMessage;
  const tone: Banner = showOnlineMessage ? 'online' : 'offline';
  const message = tone === 'online' ? ONLINE_MESSAGE : OFFLINE_MESSAGE;
  const showSpinner = tone === 'offline';

  return (
    <BannerTop
      isVisible={isVisible}
      tone={tone}
      message={message}
      showSpinner={showSpinner}
    />
  );
}
