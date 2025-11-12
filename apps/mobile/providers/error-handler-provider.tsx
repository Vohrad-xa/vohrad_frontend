import {useEffect, useRef, type ReactNode} from 'react';
import {errorManager, type AppError} from '@vohrad/api-client';
import {showAlert, showConfirmAlert} from '@/utils';

interface ErrorHandlerProviderProps {
  children: ReactNode;
  onNetworkError?: (isActive: boolean) => void;
}

const ALERT_DEBOUNCE_MS = 1000;
const NETWORK_ERROR_DELAY_MS = 5000;

export function ErrorHandlerProvider({
  children,
  onNetworkError,
}: ErrorHandlerProviderProps) {
  const lastAlertRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Subscribe to error manager
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

      // Handle network errors with delay and retry option
      if (error.category === 'network' && onNetworkError) {
        onNetworkError(true);

        timeoutRef.current = setTimeout(() => {
          onNetworkError(false);
          lastAlertRef.current = Date.now();

          if (error.isRetryable) {
            showConfirmAlert({
              title: error.title,
              message: error.message,
              confirmText: 'Retry',
              cancelText: 'Cancel',
              onConfirm: () => {
                // Could implement retry logic here if needed
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
  }, [onNetworkError]);

  return <>{children}</>;
}
