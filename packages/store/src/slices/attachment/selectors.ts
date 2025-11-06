import type {ItemAttachment} from '@vohrad/types';
import type {AttachmentSlice, AttachmentTargetKey} from './slice';

export const attachmentSelectors = {
  attachments: (state: AttachmentSlice) => state.attachments,
  imageUrls: (state: AttachmentSlice) => state.imageUrls,
  setImageUrls: (state: AttachmentSlice) => state.setImageUrls,
  isAttachmentLoading: (state: AttachmentSlice) => state.isLoading,
  setAttachmentLoading: (state: AttachmentSlice) => state.setAttachmentLoading,
  attachmentError: (state: AttachmentSlice) => state.error,
  setAttachmentError: (state: AttachmentSlice) => state.setAttachmentError,
  setLoading: (state: AttachmentSlice) => state.setLoading,
  setError: (state: AttachmentSlice) => state.setError,
  clearError: (state: AttachmentSlice) => state.clearError,
  retryCallback: (state: AttachmentSlice) => state.retryCallback,
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
  updateAttachmentsPage: (state: AttachmentSlice) =>
    state.updateAttachmentsPage,
  clearAttachmentList: (state: AttachmentSlice) => state.clearAttachmentList,
  total: (state: AttachmentSlice) => state.total,
  page: (state: AttachmentSlice) => state.page,
  size: (state: AttachmentSlice) => state.size,
  totalPages: (state: AttachmentSlice) => state.totalPages,
  hasNext: (state: AttachmentSlice) => state.hasNext,
  hasPrevious: (state: AttachmentSlice) => state.hasPrevious,
};
