import {useCallback, useEffect} from 'react';
import {useAuthStore} from '../../../store';
import {useFetchRole} from '../hooks';

export function useRoleDetailManager(roleId: string | null | undefined) {
  const {
    data: role,
    isLoading,
    isError,
    isSuccess,
    error,
    refetch,
  } = useFetchRole(roleId);

  useEffect(() => {
    if (isError && error) {
      useAuthStore.setState({
        error: error.message,
        retryCallback: () => refetch(),
      });
    } else if (isSuccess) {
      const currentError = useAuthStore.getState().error;
      if (currentError) {
        useAuthStore.setState({error: null, retryCallback: null});
      }
    }
  }, [isError, isSuccess, error, refetch]);

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    role: role ?? null,
    isLoading,
    error,
    refresh,
  };
}
