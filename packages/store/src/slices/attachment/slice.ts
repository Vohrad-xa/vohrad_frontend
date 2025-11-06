import type {StateCreator} from 'zustand';
import type {ItemAttachment, AttachmentTargetType} from '@vohrad/types';

export type AttachmentTargetKey = `${AttachmentTargetType}:${string}`;

export interface AttachmentSlice {
  imageUrls: Record<string, string>;
  isAttachmentLoading: boolean;
  attachmentError: string | null;
  attachmentsByTarget: Record<AttachmentTargetKey, ItemAttachment[]>;
  attachmentsLoadingByTarget: Record<AttachmentTargetKey, boolean>;
  attachmentsErrorByTarget: Record<AttachmentTargetKey, string | null>;
  setImageUrls: (
    urls:
      | Record<string, string>
      | ((prev: Record<string, string>) => Record<string, string>),
  ) => void;
  setAttachmentLoading: (loading: boolean) => void;
  setAttachmentError: (error: string | null) => void;
  setAttachmentsForTarget: (
    targetKey: AttachmentTargetKey,
    attachments: ItemAttachment[],
  ) => void;
  upsertAttachmentForTarget: (
    targetKey: AttachmentTargetKey,
    attachment: ItemAttachment,
  ) => void;
  removeAttachmentForTarget: (
    targetKey: AttachmentTargetKey,
    attachmentId: string,
  ) => void;
  setTargetLoading: (targetKey: AttachmentTargetKey, loading: boolean) => void;
  setTargetError: (
    targetKey: AttachmentTargetKey,
    error: string | null,
  ) => void;
  clearAttachmentsForTarget: (targetKey: AttachmentTargetKey) => void;
}

export const createAttachmentSlice: StateCreator<AttachmentSlice> = (set) => ({
  imageUrls: {},
  isAttachmentLoading: false,
  attachmentError: null,
  attachmentsByTarget: {},
  attachmentsLoadingByTarget: {},
  attachmentsErrorByTarget: {},
  setImageUrls: (urls) =>
    set((state) => ({
      imageUrls: typeof urls === 'function' ? urls(state.imageUrls) : urls,
    })),
  setAttachmentLoading: (loading: boolean) =>
    set({isAttachmentLoading: loading}),
  setAttachmentError: (error: string | null) => set({attachmentError: error}),
  setAttachmentsForTarget: (targetKey, attachments) =>
    set((state) => ({
      attachmentsByTarget: {
        ...state.attachmentsByTarget,
        [targetKey]: attachments,
      },
    })),
  upsertAttachmentForTarget: (targetKey, attachment) =>
    set((state) => {
      const existingList = state.attachmentsByTarget[targetKey] ?? [];
      const index = existingList.findIndex((item) => item.id === attachment.id);
      const nextList =
        index >= 0
          ? [
              ...existingList.slice(0, index),
              attachment,
              ...existingList.slice(index + 1),
            ]
          : [attachment, ...existingList];

      return {
        attachmentsByTarget: {
          ...state.attachmentsByTarget,
          [targetKey]: nextList,
        },
      };
    }),
  removeAttachmentForTarget: (targetKey, attachmentId) =>
    set((state) => {
      const existingList = state.attachmentsByTarget[targetKey];
      if (!existingList) {
        return {};
      }

      return {
        attachmentsByTarget: {
          ...state.attachmentsByTarget,
          [targetKey]: existingList.filter(
            (attachment) => attachment.id !== attachmentId,
          ),
        },
      };
    }),
  setTargetLoading: (targetKey, loading) =>
    set((state) => ({
      attachmentsLoadingByTarget: {
        ...state.attachmentsLoadingByTarget,
        [targetKey]: loading,
      },
    })),
  setTargetError: (targetKey, error) =>
    set((state) => ({
      attachmentsErrorByTarget: {
        ...state.attachmentsErrorByTarget,
        [targetKey]: error,
      },
    })),
  clearAttachmentsForTarget: (targetKey) =>
    set((state) => {
      const {[targetKey]: _omittedAttachments, ...restAttachments} =
        state.attachmentsByTarget;
      const {[targetKey]: _omittedLoading, ...restLoading} =
        state.attachmentsLoadingByTarget;
      const {[targetKey]: _omittedErrors, ...restErrors} =
        state.attachmentsErrorByTarget;

      return {
        attachmentsByTarget: restAttachments,
        attachmentsLoadingByTarget: restLoading,
        attachmentsErrorByTarget: restErrors,
      };
    }),
});

export function createAttachmentTargetKey(
  targetType: AttachmentTargetType,
  targetId: string,
): AttachmentTargetKey {
  return `${targetType}:${targetId}`;
}
