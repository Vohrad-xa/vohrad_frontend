import {useCallback} from 'react';
import {attachmentApi} from '@vohrad/api-client';
import type {Item} from '@vohrad/types';
import {useAuthStore} from '../../../store';
import {attachmentSelectors} from '../selectors';
import type {AttachmentImageUrlEntry} from '../slice';

export const useFetchAttachmentUrls = () => {
  const setLoading = useAuthStore(attachmentSelectors.setLoading);
  const setError = useAuthStore(attachmentSelectors.setError);
  const setImageUrls = useAuthStore(attachmentSelectors.setImageUrls);
  const imageUrls = useAuthStore(attachmentSelectors.imageUrls);

  const fetchAttachmentUrls = useCallback(
    async (items: Item[]) => {
      setLoading(true);
      setError(null);
      try {
        const staleCacheIds: string[] = [];
        const urlsToFetch = items.filter((item) => {
          const thumbnailId = item.thumbnail?.id;
          const cached = imageUrls[item.id];

          if (!thumbnailId) {
            if (cached) {
              staleCacheIds.push(item.id);
            }
            return false;
          }

          return !cached || cached.attachmentId !== thumbnailId;
        });

        if (urlsToFetch.length === 0 && staleCacheIds.length === 0) {
          setLoading(false);
          return;
        }

        const fetchedUrls: Record<string, AttachmentImageUrlEntry> = {};
        await Promise.all(
          urlsToFetch.map(async (item) => {
            if (item.thumbnail?.id) {
              const url = await attachmentApi.getAttachmentUrl(
                item.thumbnail.id,
              );
              fetchedUrls[item.id] = {
                attachmentId: item.thumbnail.id,
                url,
              };
            }
          }),
        );

        if (staleCacheIds.length === 0) {
          setImageUrls((prevUrls) => ({...prevUrls, ...fetchedUrls}));
        } else {
          setImageUrls((prevUrls) => {
            const nextUrls = {...prevUrls};
            for (const id of staleCacheIds) {
              delete nextUrls[id];
            }
            return {...nextUrls, ...fetchedUrls};
          });
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [imageUrls, setLoading, setError, setImageUrls],
  );

  return {fetchAttachmentUrls};
};
