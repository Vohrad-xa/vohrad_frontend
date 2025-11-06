import type {ItemAttachment} from '@vohrad/types';
import type {AttachmentSlice, AttachmentTargetKey} from './slice';

export const attachmentSelectors = {
  imageUrls: (state: AttachmentSlice) => state.imageUrls,
  setImageUrls: (state: AttachmentSlice) => state.setImageUrls,
  isAttachmentLoading: (state: AttachmentSlice) => state.isAttachmentLoading,
  setAttachmentLoading: (state: AttachmentSlice) => state.setAttachmentLoading,
  attachmentError: (state: AttachmentSlice) => state.attachmentError,
  setAttachmentError: (state: AttachmentSlice) => state.setAttachmentError,
  attachmentsForTarget:
    (state: AttachmentSlice) =>
    (targetKey: AttachmentTargetKey): ItemAttachment[] =>
      state.attachmentsByTarget[targetKey] ?? [],
  isTargetLoading:
    (state: AttachmentSlice) =>
    (targetKey: AttachmentTargetKey): boolean =>
      !!state.attachmentsLoadingByTarget[targetKey],
  targetError:
    (state: AttachmentSlice) =>
    (targetKey: AttachmentTargetKey): string | null =>
      state.attachmentsErrorByTarget[targetKey] ?? null,
  setAttachmentsForTarget: (state: AttachmentSlice) =>
    state.setAttachmentsForTarget,
  upsertAttachmentForTarget: (state: AttachmentSlice) =>
    state.upsertAttachmentForTarget,
  removeAttachmentForTarget: (state: AttachmentSlice) =>
    state.removeAttachmentForTarget,
  setTargetLoading: (state: AttachmentSlice) => state.setTargetLoading,
  setTargetError: (state: AttachmentSlice) => state.setTargetError,
  clearAttachmentsForTarget: (state: AttachmentSlice) =>
    state.clearAttachmentsForTarget,
};
