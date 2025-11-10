import type {ItemAttachment} from '@vohrad/types';
import type {AttachmentCacheFilters} from './utils/cache-key';
import {collectAttachmentsForFilters} from './utils/cache-selectors';
import type {AttachmentSlice, AttachmentTargetKey} from './slice';

const EMPTY_ATTACHMENTS: ItemAttachment[] = [];

export const attachmentSelectors = {
  // State
  attachments: (state: AttachmentSlice) => state.attachments,
  isAttachmentLoading: (state: AttachmentSlice) => state.attachmentIsLoading,
  attachmentError: (state: AttachmentSlice) => state.attachmentError,
  retryCallback: (state: AttachmentSlice) => state.attachmentRetryCallback,
  total: (state: AttachmentSlice) => state.attachmentTotal,
  page: (state: AttachmentSlice) => state.attachmentPage,
  size: (state: AttachmentSlice) => state.attachmentSize,
  totalPages: (state: AttachmentSlice) => state.attachmentTotalPages,
  hasNext: (state: AttachmentSlice) => state.attachmentHasNext,
  hasPrevious: (state: AttachmentSlice) => state.attachmentHasPrevious,
  links: (state: AttachmentSlice) => state.attachmentLinks,

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
      state.attachmentsByTarget[targetKey]?.attachments ?? EMPTY_ATTACHMENTS,
  isTargetLoading:
    (state: AttachmentSlice) =>
    (targetKey: AttachmentTargetKey): boolean =>
      state.attachmentsByTarget[targetKey]?.isLoading ?? false,
  targetError:
    (state: AttachmentSlice) =>
    (targetKey: AttachmentTargetKey): string | null =>
      state.attachmentsByTarget[targetKey]?.error ?? null,

  // Cache-based selectors
  attachmentsFromCache:
    (state: AttachmentSlice) => (filters: AttachmentCacheFilters) =>
      collectAttachmentsForFilters(state.attachmentCache, filters),

  // Cache management
  getCacheEntry: (state: AttachmentSlice) => state.getCacheEntry,
  setCacheEntry: (state: AttachmentSlice) => state.setCacheEntry,
  clearCache: (state: AttachmentSlice) => state.clearCache,
  addAttachmentToCache: (state: AttachmentSlice) => state.addAttachmentToCache,
  removeAttachmentFromCache: (state: AttachmentSlice) =>
    state.removeAttachmentFromCache,
  updateAttachmentInCache: (state: AttachmentSlice) =>
    state.updateAttachmentInCache,

  // Garbage collection
  startGarbageCollector: (state: AttachmentSlice) =>
    state.startGarbageCollector,
  stopGarbageCollector: (state: AttachmentSlice) => state.stopGarbageCollector,
};
