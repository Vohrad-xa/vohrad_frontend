import type {StateCreator} from 'zustand';
import type {
  ItemAttachment,
  AttachmentTargetType,
  PaginationLinks,
} from '@vohrad/types';
import {
  updateAllCacheEntries,
  addAttachmentToCacheEntry,
  removeAttachmentFromCacheEntry,
  updateAttachmentInCacheEntry,
} from './utils/cache-helpers';
import {createAttachmentCacheKey} from './utils/cache-key';

export type AttachmentTargetKey = `${AttachmentTargetType}:${string}`;

export type AttachmentImageUrlEntry = {
  attachmentId: string;
  url: string;
};

type UpdateAttachmentsPagePayload = {
  attachments: ItemAttachment[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  links: PaginationLinks | null;
  strategy?: 'replace' | 'append';
};

export type AttachmentCacheEntry = {
  attachments: ItemAttachment[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  links: PaginationLinks | null;
  fetchedAt: number;
};

export interface AttachmentSlice {
  // Namespaced pagination properties to avoid collision with ItemSlice
  attachmentTotal: number;
  attachmentPage: number;
  attachmentSize: number;
  attachmentTotalPages: number;
  attachmentHasNext: boolean;
  attachmentHasPrevious: boolean;
  attachmentLinks: PaginationLinks | null;

  // Namespaced async properties
  attachmentIsLoading: boolean;
  attachmentError: string | null;
  attachmentRetryCallback: (() => void) | null;

  // Attachment-specific properties
  attachments: ItemAttachment[];
  imageUrls: Record<string, AttachmentImageUrlEntry>;
  attachmentsByTarget: Record<AttachmentTargetKey, ItemAttachment[]>;
  attachmentsLoadingByTarget: Record<AttachmentTargetKey, boolean>;
  attachmentsErrorByTarget: Record<AttachmentTargetKey, string | null>;
  attachmentCache: Record<string, AttachmentCacheEntry>;
  setImageUrls: (
    urls:
      | Record<string, AttachmentImageUrlEntry>
      | ((
          prev: Record<string, AttachmentImageUrlEntry>,
        ) => Record<string, AttachmentImageUrlEntry>),
  ) => void;
  updateAttachmentsPage: (payload: UpdateAttachmentsPagePayload) => void;
  clearAttachmentList: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null, retryCallback?: () => void) => void;
  clearError: () => void;
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
  getCacheEntry: (cacheKey: string) => AttachmentCacheEntry | null;
  setCacheEntry: (cacheKey: string, entry: AttachmentCacheEntry) => void;
  clearCache: () => void;
  addAttachmentToCache: (
    attachment: ItemAttachment,
    hint?: {
      targetType?: AttachmentTargetType;
      targetId?: string | null;
    },
  ) => void;
  removeAttachmentFromCache: (attachmentId: string) => void;
  updateAttachmentInCache: (attachment: ItemAttachment) => void;
}

export const createAttachmentSlice: StateCreator<AttachmentSlice> = (
  set,
  get,
) => ({
  attachments: [],
  imageUrls: {},
  attachmentIsLoading: false,
  attachmentError: null,
  attachmentRetryCallback: null,
  attachmentTotal: 0,
  attachmentPage: 1,
  attachmentSize: 20,
  attachmentTotalPages: 0,
  attachmentHasNext: false,
  attachmentHasPrevious: false,
  attachmentLinks: null,
  attachmentsByTarget: {},
  attachmentsLoadingByTarget: {},
  attachmentsErrorByTarget: {},
  attachmentCache: {},
  setImageUrls: (urls) =>
    set((state) => ({
      imageUrls: typeof urls === 'function' ? urls(state.imageUrls) : urls,
    })),
  updateAttachmentsPage: ({
    attachments,
    strategy = 'replace',
    ...pagination
  }: UpdateAttachmentsPagePayload) =>
    set((state) => ({
      attachments:
        strategy === 'append' && state.attachments.length > 0
          ? [...state.attachments, ...attachments]
          : attachments,
      attachmentTotal: pagination.total,
      attachmentPage: pagination.page,
      attachmentSize: pagination.size,
      attachmentTotalPages: pagination.totalPages,
      attachmentHasNext: pagination.hasNext,
      attachmentHasPrevious: pagination.hasPrevious,
      attachmentLinks: pagination.links,
    })),
  clearAttachmentList: () =>
    set({
      attachments: [],
      attachmentTotal: 0,
      attachmentPage: 1,
      attachmentSize: 20,
      attachmentTotalPages: 0,
      attachmentHasNext: false,
      attachmentHasPrevious: false,
      attachmentLinks: null,
      attachmentError: null,
      attachmentRetryCallback: null,
    }),
  setLoading: (loading: boolean) => set({attachmentIsLoading: loading}),
  setError: (error: string | null, retryCallback?: () => void) =>
    set({
      attachmentError: error,
      attachmentRetryCallback: retryCallback ?? null,
    }),
  clearError: () => set({attachmentError: null, attachmentRetryCallback: null}),
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
  getCacheEntry: (cacheKey) => {
    return get().attachmentCache[cacheKey] ?? null;
  },
  setCacheEntry: (cacheKey, entry) =>
    set((state) => ({
      attachmentCache: {
        ...state.attachmentCache,
        [cacheKey]: entry,
      },
    })),
  clearCache: () => set({attachmentCache: {}}),
  addAttachmentToCache: (attachment, hint) =>
    set((state) => {
      const resolvedTargetType =
        hint?.targetType ??
        (attachment.attachable_type as AttachmentTargetType | undefined);
      const resolvedTargetId =
        hint?.targetId ??
        (attachment.attachable_id
          ? String(attachment.attachable_id)
          : undefined);

      const baseCache = {...state.attachmentCache};

      if (resolvedTargetType && resolvedTargetId) {
        const cacheKey = createAttachmentCacheKey({
          targetType: resolvedTargetType,
          targetId: resolvedTargetId,
        });
        const existingEntry = baseCache[cacheKey];

        if (existingEntry) {
          const alreadyPresent = existingEntry.attachments.some(
            (item) => item.id === attachment.id,
          );
          if (!alreadyPresent) {
            baseCache[cacheKey] = {
              ...existingEntry,
              attachments: [attachment, ...existingEntry.attachments],
              total: existingEntry.total + 1,
            };
          }
        } else {
          baseCache[cacheKey] = {
            attachments: [attachment],
            total: 1,
            page: 1,
            size: state.attachmentSize,
            totalPages: 1,
            hasNext: false,
            hasPrevious: false,
            links: null,
            fetchedAt: Date.now(),
          };
        }
      }

      const attachmentCache = updateAllCacheEntries(baseCache, (key, entry) =>
        addAttachmentToCacheEntry(key, entry, attachment),
      );

      const attachments = [
        attachment,
        ...state.attachments.filter((a) => a.id !== attachment.id),
      ];

      return {
        attachmentCache,
        attachments,
        attachmentTotal: state.attachmentTotal + 1,
      };
    }),
  removeAttachmentFromCache: (attachmentId) =>
    set((state) => ({
      attachmentCache: updateAllCacheEntries(
        state.attachmentCache,
        (_, entry) => removeAttachmentFromCacheEntry(entry, attachmentId),
      ),
      attachments: state.attachments.filter((a) => a.id !== attachmentId),
      attachmentTotal: Math.max(0, state.attachmentTotal - 1),
    })),
  updateAttachmentInCache: (attachment) =>
    set((state) => {
      const currentIndex = state.attachments.findIndex(
        (a) => a.id === attachment.id,
      );

      return {
        attachmentCache: updateAllCacheEntries(
          state.attachmentCache,
          (_, entry) => updateAttachmentInCacheEntry(entry, attachment),
        ),
        attachments:
          currentIndex >= 0
            ? [
                ...state.attachments.slice(0, currentIndex),
                attachment,
                ...state.attachments.slice(currentIndex + 1),
              ]
            : state.attachments,
      };
    }),
});

export function createAttachmentTargetKey(
  targetType: AttachmentTargetType,
  targetId: string,
): AttachmentTargetKey {
  return `${targetType}:${targetId}`;
}
