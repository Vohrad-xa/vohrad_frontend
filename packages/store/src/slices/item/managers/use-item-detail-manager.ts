import {useCallback, useEffect} from 'react';
import {resolveAttachmentUrl} from '@vohrad/api-client';
import type {ItemLocationUpdate} from '@vohrad/types';
import {useAuthStore} from '../../../store';
import {useFetchItem, useUpdateItemLocation} from '../hooks';

/**
 * A manager hook that provides a clean interface for fetching and mutating
 * a single item's details, powered by TanStack Query.
 */
export function useItemDetailManager(itemId: string | null | undefined) {
  const {
    data: item,
    isLoading,
    isError,
    isSuccess,
    error,
    refetch,
  } = useFetchItem(itemId);

  const updateLocationMutation = useUpdateItemLocation();

  // Bridge TanStack Query state to global Zustand error store
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

  const getItemImageUrl = useCallback(() => {
    const url = item?.thumbnail?.download_url;
    if (!url) return undefined;

    const resolved = url.startsWith('/') ? resolveAttachmentUrl(url) : url;
    return {uri: resolved};
  }, [item]);

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const updateLocation = useCallback(
    async (locationId: string, data: ItemLocationUpdate) => {
      if (!itemId) {
        throw new Error('Item ID is required to update a location.');
      }
      return updateLocationMutation.mutateAsync({itemId, locationId, data});
    },
    [itemId, updateLocationMutation],
  );

  return {
    item: item ?? null,
    getItemImageUrl,
    isLoading,
    error,
    refresh,
    updateLocation,
    isUpdatingLocation: updateLocationMutation.isPending,
  };
}
