import {useEffect, useRef, type ReactNode} from 'react';
import {useAuthStore, shallow} from '@vohrad/store';
import {showAlert, showConfirmAlert} from '@/utils';

interface ErrorHandlerProviderProps {
  children: ReactNode;
  onNetworkError?: (isActive: boolean) => void;
}

const ALERT_DEBOUNCE_MS = 1000;
const NETWORK_ERROR_DELAY_MS = 5000;

const isNetworkError = (message: string): boolean => {
  const lowerMessage = message.toLowerCase();
  return (
    lowerMessage.includes('network') ||
    lowerMessage.includes('connection') ||
    lowerMessage.includes('offline')
  );
};

export function ErrorHandlerProvider({
  children,
  onNetworkError,
}: ErrorHandlerProviderProps) {
  const lastAlertRef = useRef(0);
  const timeoutRef = useRef<number | null>(null);
  const {error, clearError, retryCallback} = useAuthStore(
    (state) => ({
      error: state.error,
      clearError: state.clearError,
      retryCallback: state.retryCallback,
    }),
    shallow,
  );

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!error) return;

    const now = Date.now();
    if (now - lastAlertRef.current < ALERT_DEBOUNCE_MS) {
      clearError();
      return;
    }

    if (isNetworkError(error) && onNetworkError) {
      onNetworkError(true);

      timeoutRef.current = setTimeout(() => {
        onNetworkError(false);
        lastAlertRef.current = Date.now();

        if (retryCallback) {
          showConfirmAlert({
            title: 'Connection Error',
            message: error,
            confirmText: 'Retry',
            cancelText: 'Cancel',
            onConfirm: () => {
              clearError();
              retryCallback();
            },
            onCancel: clearError,
            cancelIsDestructive: true,
          });
        } else {
          showAlert({
            title: 'Connection Error',
            message: error,
          });
          clearError();
        }
        timeoutRef.current = null;
      }, NETWORK_ERROR_DELAY_MS);
    } else {
      lastAlertRef.current = now;
      showAlert({
        title: 'Unable to Complete',
        message: error,
      });
      clearError();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [error, clearError, onNetworkError, retryCallback]);

  return <>{children}</>;
}
