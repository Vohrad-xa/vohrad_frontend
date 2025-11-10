import type {StateCreator} from 'zustand';
import type {
  ItemAttachment,
  AttachmentTargetType,
  PaginationLinks,
} from '@vohrad/types';
import {
  shouldEvictCache,
  evictOldestEntry,
  addAttachmentToPages,
  removeAttachmentFromPages,
  updateAttachmentInPages,
} from './utils/cache-helpers';
import {CACHE_CONFIG} from './utils/cache-config';

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

/**
 * Cache entry following TanStack Query infinite query pattern
 * Stores all pages for a given filter combination
 */
export type AttachmentCacheEntry = {
  pages: ItemAttachment[][]; // Array of pages (each page is array of attachments)
  pageParams: number[]; // Track which pages are loaded [1, 2, 3, ...]
  total: number; // Total count across all pages
  size: number; // Items per page
  totalPages: number; // Total available pages
  hasNext: boolean; // Can load more pages
  links: PaginationLinks | null; // Pagination links
  fetchedAt: number; // Timestamp for staleness check (applies to entire query)
  version?: number; // Version number for cache invalidation
};

/**
 * Entry for attachments organized by a specific target (e.g., "item:123").
 * This is a simplified cache for per-entity attachment lists.
 */
export type AttachmentsByTargetEntry = {
  attachments: ItemAttachment[];
  isLoading: boolean;
  error: string | null;
  fetchedAt: number; // Timestamp for garbage collection
  version: number; // For optimistic updates and invalidation
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

  // New centralized cache for attachments by target
  attachmentsByTarget: Record<AttachmentTargetKey, AttachmentsByTargetEntry>;

  // Multi-page list-view cache
  attachmentCache: Record<string, AttachmentCacheEntry>;

  // GC timer (use ReturnType for cross-platform compatibility)
  gcTimer: ReturnType<typeof setInterval> | null;

  // Methods
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

  // GC methods
  startGarbageCollector: () => void;
  stopGarbageCollector: () => void;
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
  attachmentCache: {},
  gcTimer: null,
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
    set((state) => {
      const entry = state.attachmentsByTarget[targetKey] ?? {
        attachments: [],
        version: 0,
      };
      return {
        attachmentsByTarget: {
          ...state.attachmentsByTarget,
          [targetKey]: {
            ...entry,
            attachments,
            isLoading: false,
            error: null,
            fetchedAt: Date.now(),
            version: entry.version + 1,
          },
        },
      };
    }),
  upsertAttachmentForTarget: (targetKey, attachment) =>
    set((state) => {
      const entry = state.attachmentsByTarget[targetKey];
      if (!entry) return {};

      const existingList = entry.attachments ?? [];
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
          [targetKey]: {
            ...entry,
            attachments: nextList,
            version: entry.version + 1,
          },
        },
      };
    }),
  removeAttachmentForTarget: (targetKey, attachmentId) =>
    set((state) => {
      const entry = state.attachmentsByTarget[targetKey];
      if (!entry) return {};

      return {
        attachmentsByTarget: {
          ...state.attachmentsByTarget,
          [targetKey]: {
            ...entry,
            attachments: entry.attachments.filter(
              (attachment) => attachment.id !== attachmentId,
            ),
            version: entry.version + 1,
          },
        },
      };
    }),
  setTargetLoading: (targetKey, loading) =>
    set((state) => {
      const entry = state.attachmentsByTarget[targetKey];
      return {
        attachmentsByTarget: {
          ...state.attachmentsByTarget,
          [targetKey]: {
            ...entry,
            isLoading: loading,
            ...(loading && {error: null}), // Clear error on new load
            fetchedAt: Date.now(), // Keep it fresh while loading
          },
        },
      };
    }),
  setTargetError: (targetKey, error) =>
    set((state) => {
      const entry = state.attachmentsByTarget[targetKey];
      if (!entry) return {};

      return {
        attachmentsByTarget: {
          ...state.attachmentsByTarget,
          [targetKey]: {
            ...entry,
            isLoading: false,
            error,
          },
        },
      };
    }),
  clearAttachmentsForTarget: (targetKey: AttachmentTargetKey) =>
    set((state) => {
      const {[targetKey]: _omitted, ...rest} = state.attachmentsByTarget;
      return {attachmentsByTarget: rest};
    }),
  getCacheEntry: (cacheKey) => {
    return get().attachmentCache[cacheKey] ?? null;
  },
  setCacheEntry: (cacheKey, entry) =>
    set((state) => {
      let currentCache = state.attachmentCache;

      // LRU eviction: Check if cache is full before adding new entry
      if (shouldEvictCache(currentCache) && !currentCache[cacheKey]) {
        currentCache = evictOldestEntry(currentCache);
      }

      return {
        attachmentCache: {
          ...currentCache,
          [cacheKey]: {...entry, version: (entry.version ?? 0) + 1},
        },
      };
    }),
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

      const updatedCache = {...state.attachmentCache};

      Object.keys(updatedCache).forEach((cacheKey) => {
        const entry = updatedCache[cacheKey];

        const shouldInclude =
          resolvedTargetType &&
          resolvedTargetId &&
          cacheKey.includes(`type:${resolvedTargetType}`) &&
          cacheKey.includes(`id:${resolvedTargetId}`);

        if (shouldInclude || cacheKey === 'all') {
          updatedCache[cacheKey] = addAttachmentToPages(entry, attachment);
        }
      });

      const attachments = [
        attachment,
        ...state.attachments.filter((a) => a.id !== attachment.id),
      ];

      return {
        attachmentCache: updatedCache,
        attachments,
        attachmentTotal: state.attachmentTotal + 1,
      };
    }),
  removeAttachmentFromCache: (attachmentId) =>
    set((state) => {
      const updatedCache = {...state.attachmentCache};

      Object.keys(updatedCache).forEach((cacheKey) => {
        updatedCache[cacheKey] = removeAttachmentFromPages(
          updatedCache[cacheKey],
          attachmentId,
        );
      });

      return {
        attachmentCache: updatedCache,
        attachments: state.attachments.filter((a) => a.id !== attachmentId),
        attachmentTotal: Math.max(0, state.attachmentTotal - 1),
      };
    }),
  updateAttachmentInCache: (attachment) =>
    set((state) => {
      const currentIndex = state.attachments.findIndex(
        (a) => a.id === attachment.id,
      );
      const updatedCache = {...state.attachmentCache};

      Object.keys(updatedCache).forEach((cacheKey) => {
        updatedCache[cacheKey] = updateAttachmentInPages(
          updatedCache[cacheKey],
          attachment,
        );
      });

      return {
        attachmentCache: updatedCache,
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
  startGarbageCollector: () => {
    // Prevent multiple GC timers
    const existingTimer = get().gcTimer;
    if (existingTimer) {
      return; // Already running
    }

    const timer = setInterval(() => {
      const now = Date.now();
      const currentCache = get().attachmentsByTarget;
      const keysToEvict: AttachmentTargetKey[] = [];

      for (const key in currentCache) {
        const entry = currentCache[key as AttachmentTargetKey];
        // Evict entries that haven't been accessed in GC_INTERVAL
        if (now - entry.fetchedAt > CACHE_CONFIG.GC_INTERVAL) {
          keysToEvict.push(key as AttachmentTargetKey);
        }
      }

      if (keysToEvict.length > 0) {
        set((state) => {
          const nextCache = {...state.attachmentsByTarget};
          keysToEvict.forEach((key) => delete nextCache[key]);
          return {attachmentsByTarget: nextCache};
        });
      }
    }, CACHE_CONFIG.GC_INTERVAL);

    set({gcTimer: timer});
  },
  stopGarbageCollector: () => {
    const timer = get().gcTimer;
    if (timer) {
      clearInterval(timer);
      set({gcTimer: null});
    }
  },
});

export function createAttachmentTargetKey(
  targetType: AttachmentTargetType,
  targetId: string,
): AttachmentTargetKey {
  return `${targetType}:${targetId}`;
}
