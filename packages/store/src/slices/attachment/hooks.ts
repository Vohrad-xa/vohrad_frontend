import {useCallback} from 'react';
import {useAuthStore, type StoreState} from '../../store';
import {attachmentApi} from '@vohrad/api-client';
import type {Item} from '@vohrad/types';

export const useAttachmentLoading = () =>
  useAuthStore((state: StoreState) => state.isAttachmentLoading);

export const useAttachmentError = () =>
  useAuthStore((state: StoreState) => state.attachmentError);

export const useAttachmentUrls = () =>
  useAuthStore((state: StoreState) => state.imageUrls);

export const useFetchAttachmentUrls = () => {
  const setAttachmentLoading = useAuthStore(
    (state: StoreState) => state.setAttachmentLoading,
  );
  const setAttachmentError = useAuthStore(
    (state: StoreState) => state.setAttachmentError,
  );
  const setImageUrls = useAuthStore((state: StoreState) => state.setImageUrls);
  const imageUrls = useAuthStore((state: StoreState) => state.imageUrls);

  const fetchAttachmentUrls = useCallback(
    async (items: Item[]) => {
      setAttachmentLoading(true);
      setAttachmentError(null);
      try {
        const urlsToFetch = items.filter(
          (item) => item.thumbnail?.id && !imageUrls[item.id],
        );

        if (urlsToFetch.length === 0) {
          setAttachmentLoading(false);
          return;
        }

        const fetchedUrls: Record<string, string> = {};
        await Promise.all(
          urlsToFetch.map(async (item) => {
            if (item.thumbnail?.id) {
              const url = await attachmentApi.getAttachmentUrl(
                item.thumbnail.id,
              );
              fetchedUrls[item.id] = url;
            }
          }),
        );

        setImageUrls((prevUrls) => ({...prevUrls, ...fetchedUrls}));
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'An unknown error occurred';
        setAttachmentError(errorMessage);
      } finally {
        setAttachmentLoading(false);
      }
    },
    [imageUrls, setAttachmentLoading, setAttachmentError, setImageUrls],
  );

  return {fetchAttachmentUrls};
};
