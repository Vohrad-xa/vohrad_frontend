import {useEffect, useState} from 'react';
import {Platform} from 'react-native';
import NetInfo, {
  type NetInfoState,
  NetInfoStateType,
} from '@react-native-community/netinfo';
import {getNavigatorOnlineStatus} from '../utils';

export function useNetInfoStatus(): NetInfoState | null {
  const [status, setStatus] = useState<NetInfoState | null>(null);

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
        console.warn('useNetInfoStatus: failed to fetch initial state', error);
      });

    const unsubscribe = NetInfo.addEventListener((state) => {
      setStatus(state);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return status;
}
