import {useCallback} from 'react';
import {userApi} from '@vohrad/api-client';
import {useAuthStore} from '../../../store';

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
