import {useCallback, useEffect} from 'react';
import {resolveAttachmentUrl} from '@vohrad/api-client';
import {
  useItemDetails,
  useFetchItemDetail,
  useUpdateItemLocation,
} from '../hooks';
import type {ItemDetail, ItemLocationUpdate} from '@vohrad/types';

export function useItemDetailManager(itemId: string | null | undefined) {
  const normalizedItemId = typeof itemId === 'string' ? itemId.trim() : '';
  const {fetchItemDetail} = useFetchItemDetail();
  const {item, isLoading, error} = useItemDetails();
  const {updateLocation, isLoading: isUpdatingLocation} =
    useUpdateItemLocation();

  useEffect(() => {
    if (!normalizedItemId) return;

    fetchItemDetail(normalizedItemId).catch(() => {});
  }, [normalizedItemId, fetchItemDetail]);

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
