import {useCallback, useMemo, useEffect} from 'react';
import type {ItemAttachment} from '@vohrad/types';
import {useAuthStore, type StoreState} from '../../../store';
import {shallow} from 'zustand/shallow';
import {createAttachmentTargetKey, type AttachmentTargetKey} from '../slice';
import type {AttachmentTargetType} from '@vohrad/types';
import {
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

const EMPTY_ATTACHMENTS: ItemAttachment[] = [];

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

  const {
    entry,
    setAttachmentsForTarget,
    upsertAttachmentForTarget,
    removeAttachmentForTarget,
    setTargetLoading,
    setTargetError,
    clearAttachmentsForTarget,
    startGarbageCollector,
    stopGarbageCollector,
    addAttachmentToCache,
    removeAttachmentFromCache,
  } = useAuthStore(
    (state: StoreState) => ({
      entry: targetKey ? state.attachmentsByTarget[targetKey] : null,
      setAttachmentsForTarget: state.setAttachmentsForTarget,
      upsertAttachmentForTarget: state.upsertAttachmentForTarget,
      removeAttachmentForTarget: state.removeAttachmentForTarget,
      setTargetLoading: state.setTargetLoading,
      setTargetError: state.setTargetError,
      clearAttachmentsForTarget: state.clearAttachmentsForTarget,
      startGarbageCollector: state.startGarbageCollector,
      stopGarbageCollector: state.stopGarbageCollector,
      addAttachmentToCache: state.addAttachmentToCache,
      removeAttachmentFromCache: state.removeAttachmentFromCache,
    }),
    shallow,
  );

  useEffect(() => {
    startGarbageCollector();
    return () => {
      stopGarbageCollector();
    };
  }, [startGarbageCollector, stopGarbageCollector]);

  const {fetchTargetAttachments} = useFetchTargetAttachments({
    setAttachmentsForTarget,
    setTargetLoading,
    setTargetError,
    removeAttachmentForTarget,
  });
  const {uploadAttachment: uploadAttachmentHook} = useUploadAttachment();
  const {deleteAttachment: deleteAttachmentHook} = useDeleteAttachment();

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

      const tempId = `temp-${Date.now()}`;
      const optimisticAttachment: ItemAttachment = {
        id: tempId,
      } as ItemAttachment;

      upsertAttachmentForTarget(targetKey, optimisticAttachment);

      try {
        const attachment = await uploadAttachmentHook(formData);

        // Remove temp and add real attachment
        removeAttachmentForTarget(targetKey, tempId);
        upsertAttachmentForTarget(targetKey, attachment);

        // Update main cache
        addAttachmentToCache(attachment, {
          targetType,
          targetId,
        });

        if (targetType === 'item') {
          upsertItemAttachment(attachment);
        }

        return attachment;
      } catch (error) {
        removeAttachmentForTarget(targetKey, tempId);
        throw error;
      }
    },
    [
      targetKey,
      targetType,
      targetId,
      uploadAttachmentHook,
      upsertAttachmentForTarget,
      removeAttachmentForTarget,
      addAttachmentToCache,
      upsertItemAttachment,
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

      const originalAttachments =
        entry?.attachments.find((a) => a.id === attachmentId) ?? null;

      // Optimistically remove from caches
      if (effectiveTargetKey) {
        removeAttachmentForTarget(effectiveTargetKey, attachmentId);
      }
      removeAttachmentFromCache(attachmentId);

      try {
        await deleteAttachmentHook(attachmentId, {
          hardDelete: options?.hardDelete,
        });

        if (effectiveTargetType === 'item' && effectiveTargetId) {
          removeItemAttachment(attachmentId);
        }
      } catch (err) {
        // Rollback caches on error
        if (effectiveTargetKey && originalAttachments) {
          upsertAttachmentForTarget(effectiveTargetKey, originalAttachments);
          addAttachmentToCache(originalAttachments, {
            targetType: effectiveTargetType,
            targetId: effectiveTargetId,
          });
        }
        if (effectiveTargetKey) {
          setTargetError(
            effectiveTargetKey,
            err instanceof Error ? err.message : 'Unable to delete attachment.',
          );
        }
        throw err;
      }
    },
    [
      entry,
      targetType,
      targetId,
      deleteAttachmentHook,
      removeAttachmentForTarget,
      removeAttachmentFromCache,
      upsertAttachmentForTarget,
      addAttachmentToCache,
      removeItemAttachment,
      setTargetError,
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

      // Update both caches for consistency
      upsertAttachmentForTarget(targetKey, attachment);
      addAttachmentToCache(attachment, {
        targetType,
        targetId,
      });
    },
    [
      targetKey,
      targetType,
      targetId,
      upsertAttachmentForTarget,
      addAttachmentToCache,
    ],
  );

  const reset = useCallback(() => {
    if (!targetKey) {
      return;
    }
    clearAttachmentsForTarget(targetKey);
  }, [clearAttachmentsForTarget, targetKey]);

  return {
    attachments: entry?.attachments ?? EMPTY_ATTACHMENTS,
    isLoading: entry?.isLoading ?? false,
    error: entry?.error ?? null,
    isReady: !!targetKey,
    fetchAttachments,
    uploadAttachment,
    deleteAttachment,
    replaceAttachments,
    patchAttachment,
    clear: reset,
  };
}
