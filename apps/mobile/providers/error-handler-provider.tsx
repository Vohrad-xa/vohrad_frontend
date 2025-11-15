import {useEffect, useRef, type ReactNode} from 'react';
import {errorManager, type AppError} from '@vohrad/api-client';
import {useNetworkConnectivity} from '@/modules/network';
import {showAlert, showConfirmAlert} from '@/utils';

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
    const unsubscribe = errorManager.subscribe((error: AppError) => {
      // Clear any pending network error timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Debounce alerts to prevent spam
      const now = Date.now();
      if (now - lastAlertRef.current < ALERT_DEBOUNCE_MS) {
        return;
      }

      const isNetworkError = error.category === 'network';
      const shouldHandleGlobalNetwork =
        isNetworkError && error.scope !== 'local';

      if (isNetworkError) {
        triggerOfflineReminder();
      }

      // Handle network errors with delay and retry option
      if (shouldHandleGlobalNetwork) {
        timeoutRef.current = setTimeout(() => {
          lastAlertRef.current = Date.now();

          if (error.isRetryable) {
            showConfirmAlert({
              title: error.title,
              message: error.message,
              confirmText: 'Retry',
              cancelText: 'Cancel',
              onConfirm: async () => {
                if (error.retryCallback) {
                  try {
                    await error.retryCallback();
                  } catch (retryError) {
                    // Retry failed, error will be reported again automatically
                    console.error('Retry failed:', retryError);
                  }
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
        // Show alert immediately for non-network errors
        lastAlertRef.current = now;
        showAlert({
          title: error.title,
          message: error.message,
        });
      }
    });

    // Cleanup
    return () => {
      unsubscribe();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [triggerOfflineReminder]);

  return <>{children}</>;
}
