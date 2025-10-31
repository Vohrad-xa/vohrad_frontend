import {useCallback, useEffect} from 'react';
import {resolveAttachmentUrl} from '@vohrad/api-client';
import {useItemDetails, useFetchItemDetail} from '../hooks';
import type {ItemDetail} from '@vohrad/types';

export function useItemDetailManager(itemId: string | null | undefined) {
  const normalizedItemId = typeof itemId === 'string' ? itemId.trim() : '';
  const {fetchItemDetail} = useFetchItemDetail();
  const {item, isLoading, error} = useItemDetails();

  useEffect(() => {
    if (normalizedItemId) {
      fetchItemDetail(normalizedItemId).catch(() => {});
    }
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

  return {
    item: item as ItemDetail | null,
    getItemImageUrl,
    isLoading,
    error,
    refresh,
  };
}
