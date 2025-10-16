import {useState, useCallback} from 'react';
import {userApi} from '@vohrad/api-client';
import {useAuthStore} from '@vohrad/store';
import type {UserUpdateData} from '@vohrad/types';

export function useUpdateProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const updateUser = useAuthStore((state) => state.updateUser);

  const updateProfile = useCallback(
    async (data: UserUpdateData): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const updatedUser = await userApi.updateUserProfile(data);
        updateUser(updatedUser);
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update profile';
        setError(errorMessage);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [updateUser],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    updateProfile,
    isLoading,
    error,
    clearError,
  };
}
