import {useCallback} from 'react';
import {itemApi} from '@vohrad/api-client';
import {useAuthStore} from '../../../store';
import {itemSelectors} from '../selectors';
import type {ItemDetail} from '@vohrad/types';
import {attachmentSelectors, createAttachmentTargetKey} from '../../attachment';

const inFlightItemDetailRequests: Record<string, Promise<void>> = {};
const lastItemDetailFetchAt: Record<string, number> = {};
const itemHasFullDetails: Record<string, boolean> = {};
// Prevent duplicate rapid requests like double click
const ITEM_DETAIL_REFETCH_THROTTLE_MS = 1000;

export function useFetchItemDetail() {
  const setSelectedItem = useAuthStore(itemSelectors.setSelectedItem);
  const setLoading = useAuthStore(itemSelectors.setLoading);
  const setError = useAuthStore(itemSelectors.setError);
  const setAttachmentsForTarget = useAuthStore(
    attachmentSelectors.setAttachmentsForTarget,
  );
  const setTargetLoading = useAuthStore(attachmentSelectors.setTargetLoading);
  const setTargetError = useAuthStore(attachmentSelectors.setTargetError);

  const fetchItemDetail = useCallback(
    async (
      id: string,
      options?: {
        force?: boolean;
      },
    ): Promise<void> => {
      const {force = false} = options ?? {};
      const existingRequest = inFlightItemDetailRequests[id];
      if (existingRequest) {
        return existingRequest;
      }

      // Read current store values inside the callback (not from closure)
      const selectedItem = useAuthStore.getState().selectedItem;
      const items = useAuthStore.getState().items;

      // Check if we already have this item data
      if (!force) {
        if (selectedItem?.id === id) {
          if (itemHasFullDetails[id]) {
            return Promise.resolve();
          }
        } else {
          const itemInList = items.find((item) => item.id === id);
          if (itemInList) {
            setSelectedItem(itemInList as ItemDetail);
          }
        }

        // Throttling only prevents rapid duplicate requests (within 1 second)
        const lastFetch = lastItemDetailFetchAt[id];
        if (
          lastFetch &&
          Date.now() - lastFetch < ITEM_DETAIL_REFETCH_THROTTLE_MS
        ) {
          return Promise.resolve();
        }
      }

      // Log only when making actual API call
      console.warn(`[API] Fetching item details from server: ${id}`);
      setLoading(true);
      setError(null);
      const targetKey = createAttachmentTargetKey('item', id);
      setTargetLoading(targetKey, true);
      setTargetError(targetKey, null);

      const request = (async () => {
        try {
          const item = await itemApi.getItemById(id);
          setSelectedItem(item);
          setAttachmentsForTarget(targetKey, item.attachments ?? []);
          lastItemDetailFetchAt[id] = Date.now();
          itemHasFullDetails[id] = true;
        } catch (err) {
          const message =
            err instanceof Error ? err.message : 'Failed to fetch item details';
          const retry = () => fetchItemDetail(id, {force: true});
          setError(message, retry);
          useAuthStore.setState({error: message, retryCallback: retry});
          setTargetError(targetKey, message);
          throw err;
        } finally {
          delete inFlightItemDetailRequests[id];
          setLoading(false);
          setTargetLoading(targetKey, false);
        }
      })();

      inFlightItemDetailRequests[id] = request;

      return request;
    },
    [
      setSelectedItem,
      setLoading,
      setError,
      setAttachmentsForTarget,
      setTargetLoading,
      setTargetError,
    ],
  );

  return {fetchItemDetail};
}
