import {useCallback, useMemo} from 'react';
import type {ItemAttachment} from '@vohrad/types';
import {useAuthStore, type StoreState} from '../../../store';
import {shallow} from 'zustand/shallow';
import {createAttachmentTargetKey, type AttachmentTargetKey} from '../slice';
import type {AttachmentTargetType} from '@vohrad/types';
import {
  useAttachmentFetchState,
  useAttachmentsByTarget,
  useFetchTargetAttachments,
  useUploadAttachment,
  useDeleteAttachment,
} from '../hooks';
import {itemSelectors} from '../../item/selectors';

type UseAttachmentManagerOptions = {
  pageSize?: number;
};

type DeleteAttachmentOptions = {
  hardDelete?: boolean;
  targetType?: AttachmentTargetType;
  targetId?: string | null;
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

  const {fetchTargetAttachments} = useFetchTargetAttachments();
  const {uploadAttachment: uploadAttachmentHook} = useUploadAttachment();
  const {deleteAttachment: deleteAttachmentHook} = useDeleteAttachment();

  const {
    setAttachmentsForTarget,
    upsertAttachmentForTarget,
    removeAttachmentForTarget,
    setTargetLoading,
    setTargetError,
    addAttachmentToCache,
    removeAttachmentFromCache,
    clearAttachmentsForTarget,
  } = useAuthStore(
    (state: StoreState) => ({
      setAttachmentsForTarget: state.setAttachmentsForTarget,
      upsertAttachmentForTarget: state.upsertAttachmentForTarget,
      removeAttachmentForTarget: state.removeAttachmentForTarget,
      setTargetLoading: state.setTargetLoading,
      setTargetError: state.setTargetError,
      addAttachmentToCache: state.addAttachmentToCache,
      removeAttachmentFromCache: state.removeAttachmentFromCache,
      clearAttachmentsForTarget: state.clearAttachmentsForTarget,
    }),
    shallow,
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

      return await fetchTargetAttachments(targetType, targetId, targetKey, {
        page,
        size,
      });
    },
    [pageSize, targetId, targetKey, targetType, fetchTargetAttachments],
  );

  const uploadAttachment = useCallback(
    async (formData: FormData): Promise<ItemAttachment> => {
      if (!targetKey) {
        throw new Error('Attachment target is not available');
      }

      const attachment = await uploadAttachmentHook(formData);
      upsertAttachmentForTarget(targetKey, attachment);

      // Update cache with new attachment (optimistic update)
      addAttachmentToCache(attachment, {
        targetType,
        targetId: targetId ?? null,
      });

      // Also update item store if this is an item attachment
      if (targetType === 'item') {
        upsertItemAttachment(attachment);
      }

      return attachment;
    },
    [
      targetKey,
      targetType,
      targetId,
      uploadAttachmentHook,
      upsertAttachmentForTarget,
      upsertItemAttachment,
      addAttachmentToCache,
    ],
  );

  const deleteAttachment = useCallback(
    async (attachmentId: string, options?: DeleteAttachmentOptions) => {
      const effectiveTargetType = options?.targetType ?? targetType;
      const effectiveTargetId = options?.targetId ?? targetId ?? undefined;
      const effectiveTargetKey =
        effectiveTargetId != null && effectiveTargetId !== ''
          ? createAttachmentTargetKey(effectiveTargetType, effectiveTargetId)
          : null;

      if (effectiveTargetKey) {
        setTargetLoading(effectiveTargetKey, true);
        setTargetError(effectiveTargetKey, null);
      }

      try {
        await deleteAttachmentHook(attachmentId, {
          hardDelete: options?.hardDelete,
        });

        if (effectiveTargetKey) {
          removeAttachmentForTarget(effectiveTargetKey, attachmentId);
        }

        // Update cache to remove attachment (optimistic update)
        removeAttachmentFromCache(attachmentId);

        // Also update item store if this is an item attachment
        if (effectiveTargetType === 'item' && effectiveTargetId) {
          removeItemAttachment(attachmentId);
        }
      } catch (err) {
        if (effectiveTargetKey) {
          const message =
            err instanceof Error
              ? err.message
              : 'Unable to delete attachment right now.';
          setTargetError(effectiveTargetKey, message);
        }
        throw err;
      } finally {
        if (effectiveTargetKey) {
          setTargetLoading(effectiveTargetKey, false);
        }
      }
    },
    [
      removeAttachmentForTarget,
      targetType,
      targetId,
      deleteAttachmentHook,
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
