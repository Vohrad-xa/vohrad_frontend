import {useState, useCallback} from 'react';
import {userApi} from '@vohrad/api-client';
import {useAuthStore} from '../../store';
import {authSelectors} from './selectors';
import type {User, UserUpdateData} from '@vohrad/types';

export function useProfileDetails(): User | null {
  return useAuthStore(authSelectors.user);
}

export function useFetchUserProfile() {
  const setUser = useAuthStore((state) => state.setUser);
  const setError = useAuthStore((state) => state.setError);

  const fetchUserProfile = useCallback(async (): Promise<void> => {
    try {
      const user = await userApi.getUserProfile();
      setUser(user);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to refresh profile';
      setError(message, fetchUserProfile);
    }
  }, [setUser, setError]);

  return {
    fetchUserProfile,
  };
}

export function useUpdateProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const updateUser = useAuthStore(authSelectors.updateUser);
  const setError = useAuthStore((state) => state.setError);

  const updateProfile = useCallback(
    async (data: UserUpdateData): Promise<void> => {
      setIsLoading(true);

      try {
        const updatedUser = await userApi.updateUserProfile(data);
        updateUser(updatedUser);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to update profile';
        setError(message, () => updateProfile(data));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [updateUser, setError],
  );

  return {
    updateProfile,
    isLoading,
  };
}

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
