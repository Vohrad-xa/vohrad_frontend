import {useCallback} from 'react';
import {userApi} from '@sykamore/api-client';
import {useAuthStore} from '../../../store';

export function useFetchUserProfile() {
  const setUser = useAuthStore((state) => state.setUser);

  const fetchUserProfile = useCallback(async (): Promise<void> => {
    try {
      const user = await userApi.getUserProfile();
      setUser(user);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to refresh profile';

      // Set error on global auth slice for ErrorHandlerProvider
      useAuthStore.setState({error: message, retryCallback: fetchUserProfile});
    }
  }, [setUser]);

  return {
    fetchUserProfile,
  };
}
