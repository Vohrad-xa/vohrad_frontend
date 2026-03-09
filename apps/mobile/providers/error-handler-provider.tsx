import {useEffect, useRef, type ReactNode} from 'react';
import {
  ensureClientRuntimeConnected,
  errorCenter,
  type AppError,
} from '@sykamore/client-runtime';
import {useNetworkConnectivity} from '@/features/network';
import {showAlert, showConfirmAlert} from '@/utils/alert';

interface ErrorHandlerProviderProps {
  children: ReactNode;
}

const ALERT_DEBOUNCE_MS = 1000;
const NETWORK_ERROR_DELAY_MS = 5000;

export function ErrorHandlerProvider({children}: ErrorHandlerProviderProps) {
  const lastAlertRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const {triggerOfflineReminder} = useNetworkConnectivity();

  useEffect(() => {
    ensureClientRuntimeConnected();

    const unsubscribeCenter = errorCenter.subscribe((error: AppError) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      const now = Date.now();
      if (now - lastAlertRef.current < ALERT_DEBOUNCE_MS) {
        return;
      }

      const isNetworkError =
        error.category === 'network' || error.category === 'timeout';
      const shouldHandleGlobalNetwork =
        isNetworkError && error.scope !== 'local';

      if (isNetworkError) {
        triggerOfflineReminder();
      }

      if (shouldHandleGlobalNetwork) {
        timeoutRef.current = setTimeout(() => {
          lastAlertRef.current = Date.now();

          if (error.isRetryable && error.retryCallback) {
            showConfirmAlert({
              title: error.title,
              message: error.message,
              confirmText: 'Retry',
              cancelText: 'Cancel',
              onConfirm: async () => {
                try {
                  await error.retryCallback?.();
                } catch (retryError) {
                  console.error('Retry failed:', retryError);
                }
              },
              cancelIsDestructive: true,
            });
          } else {
            showAlert({
              title: error.title,
              message: error.message,
            });
          }

          timeoutRef.current = null;
        }, NETWORK_ERROR_DELAY_MS);
      } else {
        lastAlertRef.current = now;
        showAlert({
          title: error.title,
          message: error.message,
        });
      }
    });

    return () => {
      unsubscribeCenter();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [triggerOfflineReminder]);

  return <>{children}</>;
}
