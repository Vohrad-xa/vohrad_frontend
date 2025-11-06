import {useCallback, useEffect} from 'react';
import {resolveAttachmentUrl} from '@vohrad/api-client';
import {
  useItemDetails,
  useFetchItemDetail,
  useUpdateItemLocation,
} from '../hooks';
import {useAuthStore} from '../../../store';
import type {ItemDetail, ItemLocationUpdate} from '@vohrad/types';

type UseItemDetailManagerOptions = {
  fetchOnMount?: boolean;
};

export function useItemDetailManager(
  itemId: string | null | undefined,
  options?: UseItemDetailManagerOptions,
) {
  const normalizedItemId = typeof itemId === 'string' ? itemId.trim() : '';
  const {fetchItemDetail} = useFetchItemDetail();
  const {item, isLoading, error} = useItemDetails();
  const {updateLocation, isLoading: isUpdatingLocation} =
    useUpdateItemLocation();
  const fetchOnMount = options?.fetchOnMount ?? true;

  useEffect(() => {
    if (!normalizedItemId) return;

    const current = useAuthStore.getState().selectedItem;
    if (fetchOnMount || !current || current.id !== normalizedItemId) {
      fetchItemDetail(normalizedItemId).catch(() => {});
    }
  }, [normalizedItemId, fetchItemDetail, fetchOnMount]);

  const getItemImageUrl = useCallback(() => {
    const url = item?.thumbnail?.download_url;
    if (!url) return undefined;

    const resolved = url.startsWith('/') ? resolveAttachmentUrl(url) : url;
    return {uri: resolved};
  }, [item]);

  const refresh = useCallback(async () => {
    if (normalizedItemId) {
      await fetchItemDetail(normalizedItemId, {force: true});
    }
  }, [normalizedItemId, fetchItemDetail]);

  const handleUpdateLocation = useCallback(
    async (locationId: string, data: ItemLocationUpdate) => {
      if (!normalizedItemId) {
        throw new Error('Item ID is required');
      }
      await updateLocation(normalizedItemId, locationId, data);
    },
    [normalizedItemId, updateLocation],
  );

  return {
    item: item as ItemDetail | null,
    getItemImageUrl,
    isLoading,
    error,
    refresh,
    updateLocation: handleUpdateLocation,
    isUpdatingLocation,
  };
}
