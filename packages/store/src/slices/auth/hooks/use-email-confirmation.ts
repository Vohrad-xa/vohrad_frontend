import {useState, useCallback} from 'react';
import {userApi} from '@vohrad/api-client';
import {useAuthStore} from '../../../store';
import {authSelectors} from '../selectors';

export function useEmailConfirmation() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const updateUser = useAuthStore(authSelectors.updateUser);

  const resendPendingEmail = useCallback(async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const user = await userApi.resendPendingEmail();
      updateUser(user);
      return true;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to resend confirmation email';
      setError(message);
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [updateUser]);

  const clearError = useCallback(() => setError(null), []);

  return {
    resendPendingEmail,
    isProcessing,
    error,
    clearError,
  };
}
