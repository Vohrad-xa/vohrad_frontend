import type {ItemAttachment} from '@vohrad/types';
import type {AttachmentSlice, AttachmentTargetKey} from './slice';

export const attachmentSelectors = {
  // State
  attachments: (state: AttachmentSlice) => state.attachments,
  isAttachmentLoading: (state: AttachmentSlice) => state.isLoading,
  attachmentError: (state: AttachmentSlice) => state.error,
  retryCallback: (state: AttachmentSlice) => state.retryCallback,
  total: (state: AttachmentSlice) => state.total,
  page: (state: AttachmentSlice) => state.page,
  size: (state: AttachmentSlice) => state.size,
  totalPages: (state: AttachmentSlice) => state.totalPages,
  hasNext: (state: AttachmentSlice) => state.hasNext,
  hasPrevious: (state: AttachmentSlice) => state.hasPrevious,
  links: (state: AttachmentSlice) => state.links,

  // Image URLs
  imageUrls: (state: AttachmentSlice) => state.imageUrls,
  setImageUrls: (state: AttachmentSlice) => state.setImageUrls,

  // Actions
  setLoading: (state: AttachmentSlice) => state.setLoading,
  setError: (state: AttachmentSlice) => state.setError,
  clearError: (state: AttachmentSlice) => state.clearError,
  updateAttachmentsPage: (state: AttachmentSlice) =>
    state.updateAttachmentsPage,
  clearAttachmentList: (state: AttachmentSlice) => state.clearAttachmentList,

  // Target-specific selectors
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

  // Cache management
  getCacheEntry: (state: AttachmentSlice) => state.getCacheEntry,
  setCacheEntry: (state: AttachmentSlice) => state.setCacheEntry,
  clearCache: (state: AttachmentSlice) => state.clearCache,
  addAttachmentToCache: (state: AttachmentSlice) => state.addAttachmentToCache,
  removeAttachmentFromCache: (state: AttachmentSlice) =>
    state.removeAttachmentFromCache,
  updateAttachmentInCache: (state: AttachmentSlice) =>
    state.updateAttachmentInCache,
};
