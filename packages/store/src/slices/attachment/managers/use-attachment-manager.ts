import {useCallback, useMemo} from 'react';
import {attachmentApi} from '@vohrad/api-client';
import type {ItemAttachment} from '@vohrad/types';
import {useAuthStore, type StoreState} from '../../../store';
import {createAttachmentTargetKey, type AttachmentTargetKey} from '../slice';
import type {AttachmentTargetType} from '@vohrad/types';
import {useAttachmentFetchState, useAttachmentsByTarget} from '../hooks';
import {itemSelectors} from '../../item/selectors';

type UseAttachmentManagerOptions = {
  pageSize?: number;
};

export function useAttachmentManager(
  targetType: AttachmentTargetType,
  targetId?: string | null,
  options?: UseAttachmentManagerOptions,
) {
  const pageSize = options?.pageSize ?? 50;
  const targetKey: AttachmentTargetKey | null = useMemo(() => {
    if (!targetId) return null;
    return createAttachmentTargetKey(targetType, targetId);
  }, [targetType, targetId]);

  const attachments = useAttachmentsByTarget(targetType, targetId);
  const {isLoading, error} = useAttachmentFetchState(targetType, targetId);

  const setAttachmentsForTarget = useAuthStore(
    (state: StoreState) => state.setAttachmentsForTarget,
  );
  const upsertAttachmentForTarget = useAuthStore(
    (state: StoreState) => state.upsertAttachmentForTarget,
  );
  const removeAttachmentForTarget = useAuthStore(
    (state: StoreState) => state.removeAttachmentForTarget,
  );
  const setTargetLoading = useAuthStore(
    (state: StoreState) => state.setTargetLoading,
  );
  const setTargetError = useAuthStore(
    (state: StoreState) => state.setTargetError,
  );
  const addAttachmentToCache = useAuthStore(
    (state: StoreState) => state.addAttachmentToCache,
  );
  const removeAttachmentFromCache = useAuthStore(
    (state: StoreState) => state.removeAttachmentFromCache,
  );
  const clearAttachmentsForTarget = useAuthStore(
    (state: StoreState) => state.clearAttachmentsForTarget,
  );
  const upsertItemAttachment = useAuthStore((state: StoreState) =>
    itemSelectors.upsertItemAttachment(state),
  );
  const removeItemAttachment = useAuthStore((state: StoreState) =>
    itemSelectors.removeItemAttachment(state),
  );

  const fetchAttachments = useCallback(
    async (params?: {page?: number; size?: number}) => {
      if (!targetKey || !targetId) {
        return [];
      }

      const page = params?.page ?? 1;
      const size = params?.size ?? pageSize;

      setTargetLoading(targetKey, true);
      setTargetError(targetKey, null);

      try {
        const response = await attachmentApi.listAttachments({
          targetType,
          targetId,
          page,
          size,
        });
        const items = response.data.items ?? [];
        setAttachmentsForTarget(targetKey, items);
        return items;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Unable to load attachments right now.';
        setTargetError(targetKey, message);
        throw err;
      } finally {
        setTargetLoading(targetKey, false);
      }
    },
    [
      pageSize,
      setAttachmentsForTarget,
      setTargetError,
      setTargetLoading,
      targetId,
      targetKey,
      targetType,
    ],
  );

  const uploadAttachment = useCallback(
    async (formData: FormData): Promise<ItemAttachment> => {
      if (!targetKey) {
        throw new Error('Attachment target is not available');
      }

      const attachment = await attachmentApi.uploadAttachment(formData);
      upsertAttachmentForTarget(targetKey, attachment);

      // Update cache with new attachment (optimistic update)
      addAttachmentToCache(attachment);

      // Also update item store if this is an item attachment
      if (targetType === 'item') {
        upsertItemAttachment(attachment);
      }

      return attachment;
    },
    [
      targetKey,
      targetType,
      upsertAttachmentForTarget,
      upsertItemAttachment,
      addAttachmentToCache,
    ],
  );

  const deleteAttachment = useCallback(
    async (attachmentId: string, options?: {hardDelete?: boolean}) => {
      if (!targetKey) {
        throw new Error('Attachment target is not available');
      }

      setTargetLoading(targetKey, true);
      setTargetError(targetKey, null);

      try {
        await attachmentApi.deleteAttachment(attachmentId, options);
        removeAttachmentForTarget(targetKey, attachmentId);

        // Update cache to remove attachment (optimistic update)
        removeAttachmentFromCache(attachmentId);

        // Also update item store if this is an item attachment
        if (targetType === 'item') {
          removeItemAttachment(attachmentId);
        }
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Unable to delete attachment right now.';
        setTargetError(targetKey, message);
        throw err;
      } finally {
        setTargetLoading(targetKey, false);
      }
    },
    [
      removeAttachmentForTarget,
      targetKey,
      targetType,
      removeItemAttachment,
      setTargetError,
      setTargetLoading,
      removeAttachmentFromCache,
    ],
  );

  const replaceAttachments = useCallback(
    (items: ItemAttachment[]) => {
      if (!targetKey) return;
      setAttachmentsForTarget(targetKey, items);
    },
    [setAttachmentsForTarget, targetKey],
  );

  const patchAttachment = useCallback(
    (attachment: ItemAttachment) => {
      if (!targetKey) return;
      upsertAttachmentForTarget(targetKey, attachment);
    },
    [targetKey, upsertAttachmentForTarget],
  );

  const reset = useCallback(() => {
    if (!targetKey) {
      return;
    }
    clearAttachmentsForTarget(targetKey);
  }, [clearAttachmentsForTarget, targetKey]);

  return {
    attachments,
    isLoading,
    error,
    isReady: !!targetKey,
    fetchAttachments,
    uploadAttachment,
    deleteAttachment,
    replaceAttachments,
    patchAttachment,
    clear: reset,
  };
}
