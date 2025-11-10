import {useCallback, useEffect, useMemo, useState} from 'react';
import {type ListAttachmentsParams} from '@vohrad/api-client';
import {useAuthStore} from '../../../store';
import {shallow} from 'zustand/shallow';
import {attachmentSelectors} from '../selectors';
import {createAttachmentCacheKey} from '../utils/cache-key';
import {useFetchAttachments} from '../hooks';
import {
  isStaleEntry,
  getAllAttachmentsFromPages,
  appendPageToCacheEntry,
} from '../utils/cache-helpers';
import {CACHE_CONFIG} from '../utils/cache-config';

type AttachmentListFilters = Omit<ListAttachmentsParams, 'page' | 'size'>;

type UseAttachmentsListManagerOptions = {
  pageSize?: number;
  initialFilters?: AttachmentListFilters;
  staleTime?: number;
};

export function useAttachmentsListManager(
  options?: UseAttachmentsListManagerOptions,
) {
  const pageSize = options?.pageSize ?? 20;
  const staleTime = options?.staleTime ?? CACHE_CONFIG.STALE_TIME;
  const [filters, setFilters] = useState<AttachmentListFilters>(
    options?.initialFilters ?? {},
  );

  const {
    attachments,
    isLoading,
    error,
    retryCallback,
    total,
    page,
    size,
    totalPages,
    hasNext,
    hasPrevious,
    links,
  } = useAuthStore(
    (state) => ({
      attachments: attachmentSelectors.attachments(state),
      isLoading: attachmentSelectors.isAttachmentLoading(state),
      error: attachmentSelectors.attachmentError(state),
      retryCallback: attachmentSelectors.retryCallback(state),
      total: attachmentSelectors.total(state),
      page: attachmentSelectors.page(state),
      size: attachmentSelectors.size(state),
      totalPages: attachmentSelectors.totalPages(state),
      hasNext: attachmentSelectors.hasNext(state),
      hasPrevious: attachmentSelectors.hasPrevious(state),
      links: attachmentSelectors.links(state),
    }),
    shallow,
  );

  const {
    updateAttachmentsPage,
    clearAttachmentList,
    getCacheEntry,
    setCacheEntry,
    setError,
  } = useAuthStore(
    (state) => ({
      updateAttachmentsPage: state.updateAttachmentsPage,
      clearAttachmentList: state.clearAttachmentList,
      getCacheEntry: state.getCacheEntry,
      setCacheEntry: state.setCacheEntry,
      setError: state.setError,
    }),
    shallow,
  );

  const {fetchAttachments} = useFetchAttachments();

  const fetchByUrl = useCallback(
    async (url: string, strategy: 'replace' | 'append') => {
      await fetchAttachments(url, {append: strategy === 'append'});
    },
    [fetchAttachments],
  );

  const fetchPage = useCallback(
    async (
      targetPage: number,
      append = false,
      signal?: AbortSignal,
      skipCache = false,
    ) => {
      const cacheKey = createAttachmentCacheKey(filters);

      if (!skipCache) {
        // Check exact cache match first
        const cached = getCacheEntry(cacheKey);
        if (cached && !isStaleEntry(cached, staleTime)) {
          const pageIndex = cached.pageParams.indexOf(targetPage);
          if (pageIndex >= 0) {
            // Page already cached return all
            const allAttachments = getAllAttachmentsFromPages(cached.pages);
            updateAttachmentsPage({
              attachments: allAttachments,
              total: cached.total,
              page: targetPage,
              size: cached.size,
              totalPages: cached.totalPages,
              hasNext: cached.hasNext,
              hasPrevious: targetPage > 1,
              links: cached.links,
              strategy: append ? 'append' : 'replace',
            });
            return;
          }
        }

        // Smart cache fallback: Filter from broader cache if available
        if (filters.kind) {
          const broaderFilters: {
            targetType?: typeof filters.targetType;
            targetId?: typeof filters.targetId;
          } = {};

          if (filters.targetType)
            broaderFilters.targetType = filters.targetType;
          if (filters.targetId) broaderFilters.targetId = filters.targetId;

          const broaderKey = createAttachmentCacheKey(broaderFilters);
          const broaderCache = getCacheEntry(broaderKey);

          if (broaderCache && !isStaleEntry(broaderCache, staleTime)) {
            // ALL data is already cached so we filter client-side (zero latency)
            const allBroaderAttachments = getAllAttachmentsFromPages(
              broaderCache.pages,
            );
            const filteredAttachments = allBroaderAttachments.filter(
              (a) => a.kind === filters.kind,
            );

            updateAttachmentsPage({
              attachments: filteredAttachments,
              total: filteredAttachments.length,
              page: 1,
              size: pageSize,
              totalPages: Math.ceil(filteredAttachments.length / pageSize),
              hasNext: filteredAttachments.length > pageSize,
              hasPrevious: false,
              links: null,
              strategy: 'replace',
            });
            return;
          }
        }
      }

      try {
        await fetchAttachments(
          {...filters, page: targetPage, size: pageSize},
          {append, signal},
        );

        const state = useAuthStore.getState();
        const newPageData = attachmentSelectors.attachments(state);
        const currentCache = getCacheEntry(cacheKey);

        const newEntry =
          targetPage === 1 || !currentCache
            ? {
                pages: [newPageData],
                pageParams: [targetPage],
                total: attachmentSelectors.total(state),
                size: attachmentSelectors.size(state),
                totalPages: attachmentSelectors.totalPages(state),
                hasNext: attachmentSelectors.hasNext(state),
                links: attachmentSelectors.links(state),
                fetchedAt: Date.now(),
              }
            : {
                ...appendPageToCacheEntry(
                  currentCache,
                  newPageData,
                  targetPage,
                ),
                total: attachmentSelectors.total(state),
                totalPages: attachmentSelectors.totalPages(state),
                hasNext: attachmentSelectors.hasNext(state),
                links: attachmentSelectors.links(state),
              };
        setCacheEntry(cacheKey, newEntry);
      } catch (err) {
        if (err instanceof Error && err.message === 'Request cancelled') {
          return;
        }
        setError(
          err instanceof Error ? err.message : 'Unable to load attachments.',
          () => {
            void fetchPage(targetPage, append, undefined, skipCache);
          },
        );
        throw err;
      }
    },
    [
      filters,
      pageSize,
      staleTime,
      setError,
      fetchAttachments,
      getCacheEntry,
      setCacheEntry,
      updateAttachmentsPage,
    ],
  );

  useEffect(() => {
    // Only fetch if there's an actual filter
    const hasFilter = Boolean(
      filters.kind || filters.targetType || filters.targetId,
    );
    if (!hasFilter) return;

    const controller = new AbortController();
    fetchPage(1, false, controller.signal).catch(() => {});
    return () => controller.abort();
  }, [filters, fetchPage]);

  const refresh = useCallback(
    async (skipCache = true) => {
      if (links?.first) {
        await fetchByUrl(links.first, 'replace');
      } else {
        await fetchPage(1, false, undefined, skipCache);
      }
    },
    [fetchPage, fetchByUrl, links],
  );

  const loadMore = useCallback(async () => {
    if (!hasNext || isLoading || !links?.next) return;
    await fetchByUrl(links.next, 'append');
  }, [hasNext, isLoading, links, fetchByUrl]);

  const reset = useCallback(() => {
    clearAttachmentList();
  }, [clearAttachmentList]);

  const appliedFilters = useMemo(() => filters, [filters]);

  return {
    attachments,
    total,
    page,
    size,
    totalPages,
    hasNext,
    hasPrevious,
    isLoading,
    error,
    retryCallback,
    filters: appliedFilters,
    setFilters,
    refresh,
    loadMore,
    fetchPage,
    reset,
  };
}
