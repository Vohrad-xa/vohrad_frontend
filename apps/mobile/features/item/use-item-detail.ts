import {useCallback, useEffect} from 'react';
import {resolveAttachmentUrl} from '@vohrad/api-client';
import {useItemDetails, useFetchItemDetail} from '@vohrad/store';
import type {ItemDetail} from '@vohrad/types';

export function useItemDetail(itemId: string | null | undefined) {
  const normalizedItemId = typeof itemId === 'string' ? itemId.trim() : '';
  const {fetchItemDetail} = useFetchItemDetail();
  const {item, isLoading, error} = useItemDetails();

  // Fetch item details on mount
  useEffect(() => {
    if (normalizedItemId) {
      fetchItemDetail(normalizedItemId).catch(() => {});
    }
  }, [normalizedItemId, fetchItemDetail]);

  // Get image URL
  const getItemImageUrl = useCallback(() => {
    const url = item?.thumbnail?.download_url;
    if (url) {
      const resolved = url.startsWith('/') ? resolveAttachmentUrl(url) : url;
      return {uri: resolved};
    }
    return undefined;
  }, [item]);

  // Refresh
  const refresh = useCallback(async () => {
    if (normalizedItemId) {
      await fetchItemDetail(normalizedItemId, {force: true});
    }
  }, [normalizedItemId, fetchItemDetail]);

  return {
    item: item as ItemDetail | null,
    getItemImageUrl,
    isLoading,
    error,
    refresh,
  };
}
