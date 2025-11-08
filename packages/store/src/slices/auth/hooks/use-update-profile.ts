import {useState, useCallback} from 'react';
import {userApi} from '@vohrad/api-client';
import {useAuthStore} from '../../../store';
import {authSelectors} from '../selectors';
import type {UserUpdateData} from '@vohrad/types';

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
