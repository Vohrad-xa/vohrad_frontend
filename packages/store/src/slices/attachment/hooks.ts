import {useCallback, useMemo} from 'react';
import {attachmentApi} from '@vohrad/api-client';
import type {Item} from '@vohrad/types';
import {useAuthStore, type StoreState} from '../../store';
import {attachmentSelectors} from './selectors';
import {createAttachmentTargetKey, type AttachmentTargetKey} from './slice';
import type {AttachmentTargetType} from '@vohrad/types';

type AttachmentTargetRef = {
  targetType: AttachmentTargetType;
  targetId?: string | null;
};

function useAttachmentTargetKey(
  ref: AttachmentTargetRef,
): AttachmentTargetKey | null {
  return useMemo(() => {
    if (!ref.targetId) return null;
    return createAttachmentTargetKey(ref.targetType, ref.targetId);
  }, [ref.targetType, ref.targetId]);
}

export const useAttachmentLoading = () =>
  useAuthStore((state: StoreState) =>
    attachmentSelectors.isAttachmentLoading(state),
  );

export const useAttachmentError = () =>
  useAuthStore((state: StoreState) =>
    attachmentSelectors.attachmentError(state),
  );

export const useAttachmentUrls = () =>
  useAuthStore((state: StoreState) => attachmentSelectors.imageUrls(state));

export function useAttachmentsByTarget(
  targetType: AttachmentTargetType,
  targetId?: string | null,
) {
  const targetKey = useAttachmentTargetKey({targetType, targetId});
  return useAuthStore(
    useCallback(
      (state: StoreState) =>
        targetKey
          ? attachmentSelectors.attachmentsForTarget(state)(targetKey)
          : [],
      [targetKey],
    ),
  );
}

export function useAttachmentFetchState(
  targetType: AttachmentTargetType,
  targetId?: string | null,
) {
  const targetKey = useAttachmentTargetKey({targetType, targetId});
  const isLoading = useAuthStore(
    useCallback(
      (state: StoreState) =>
        targetKey
          ? attachmentSelectors.isTargetLoading(state)(targetKey)
          : false,
      [targetKey],
    ),
  );
  const error = useAuthStore(
    useCallback(
      (state: StoreState) =>
        targetKey ? attachmentSelectors.targetError(state)(targetKey) : null,
      [targetKey],
    ),
  );

  return {isLoading, error};
}

export const useFetchAttachmentUrls = () => {
  const setAttachmentLoading = useAuthStore(
    attachmentSelectors.setAttachmentLoading,
  );
  const setAttachmentError = useAuthStore(
    attachmentSelectors.setAttachmentError,
  );
  const setImageUrls = useAuthStore(attachmentSelectors.setImageUrls);
  const imageUrls = useAuthStore(attachmentSelectors.imageUrls);

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
