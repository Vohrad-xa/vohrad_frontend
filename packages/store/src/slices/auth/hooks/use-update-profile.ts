import {useState, useCallback} from 'react';
import {userApi} from '@sykamore/api-client';
import {useAuthStore} from '../../../store';
import {authSelectors} from '../selectors';
import type {UserUpdateData} from '@sykamore/types';

export function useUpdateProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const updateUser = useAuthStore(authSelectors.updateUser);

  const updateProfile = useCallback(
    async (data: UserUpdateData): Promise<void> => {
      setIsLoading(true);

      try {
        const updatedUser = await userApi.updateUserProfile(data);
        updateUser(updatedUser);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to update profile';
        const retry = () => updateProfile(data);

        // Set error on global auth slice for ErrorHandlerProvider
        useAuthStore.setState({error: message, retryCallback: retry});

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [updateUser],
  );

  return {
    updateProfile,
    isLoading,
  };
}
