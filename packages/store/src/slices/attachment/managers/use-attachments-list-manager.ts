import {useCallback, useEffect, useMemo, useState} from 'react';
import {attachmentApi, type ListAttachmentsParams} from '@vohrad/api-client';
import {useAuthStore} from '../../../store';
import {shallow} from 'zustand/shallow';
import {attachmentSelectors} from '../selectors';
import {createAttachmentCacheKey} from '../utils/cache-key';

type AttachmentListFilters = Omit<ListAttachmentsParams, 'page' | 'size'>;

type UseAttachmentsListManagerOptions = {
  pageSize?: number;
  initialFilters?: AttachmentListFilters;
};

export function useAttachmentsListManager(
  options?: UseAttachmentsListManagerOptions,
) {
  const pageSize = options?.pageSize ?? 20;
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
    shallow
  );

  const updateAttachmentsPage = useAuthStore(
    attachmentSelectors.updateAttachmentsPage,
  );
  const clearAttachmentList = useAuthStore(
    attachmentSelectors.clearAttachmentList,
  );
  const setLoading = useAuthStore(attachmentSelectors.setLoading);
  const setError = useAuthStore(attachmentSelectors.setError);
  const getCacheEntry = useAuthStore(attachmentSelectors.getCacheEntry);
  const setCacheEntry = useAuthStore(attachmentSelectors.setCacheEntry);

  const fetchByUrl = useCallback(
    async (url: string, strategy: 'replace' | 'append') => {
      setLoading(true);
      setError(null);

      try {
        const response = await attachmentApi.listAttachments(url);
        const data = response.data;
        updateAttachmentsPage({
          attachments: data.items ?? [],
          total: data.total,
          page: data.page,
          size: data.size,
          totalPages: data.total_pages,
          hasNext: data.has_next,
          hasPrevious: data.has_previous,
          links: response.metadata?.links ?? null,
          strategy,
        });
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Unable to load attachments right now.';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, updateAttachmentsPage],
  );

  const fetchPage = useCallback(
    async (
      targetPage: number,
      append = false,
      signal?: AbortSignal,
      skipCache = false,
    ) => {
      // Generate cache key from current filters (page 1 only for cache)
      const cacheKey = createAttachmentCacheKey(filters);

      // Check cache first (only for page 1, not for pagination/append)
      if (!skipCache && targetPage === 1 && !append) {
        const cached = getCacheEntry(cacheKey);
        if (cached) {
          // Load from cache immediately
          updateAttachmentsPage({
            attachments: cached.attachments,
            total: cached.total,
            page: cached.page,
            size: cached.size,
            totalPages: cached.totalPages,
            hasNext: cached.hasNext,
            hasPrevious: cached.hasPrevious,
            links: cached.links,
            strategy: 'replace',
          });
          return; // Skip fetch, use cache
        }

        // Smart cache fallback: If kind filter exists, check broader cache and filter client-side
        if (filters.kind) {
          // Build broader cache key without kind filter
          const broaderFilters: {
            targetType?: typeof filters.targetType;
            targetId?: typeof filters.targetId;
          } = {};

          if (filters.targetType)
            broaderFilters.targetType = filters.targetType;
          if (filters.targetId) broaderFilters.targetId = filters.targetId;

          const broaderKey = createAttachmentCacheKey(broaderFilters);
          const broaderCache = getCacheEntry(broaderKey);

          if (broaderCache) {
            // Filter client-side from broader cache (instant, no API call)
            const filteredAttachments = broaderCache.attachments.filter(
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
            return; // Skip fetch, use filtered cache
          }
        }
      }

      setLoading(true);
      setError(null);

      try {
        const response = await attachmentApi.listAttachments({
          ...filters,
          page: targetPage,
          size: pageSize,
        });

        // Don't update state if request was aborted
        if (signal?.aborted) {
          return;
        }

        const data = response.data;
        const pageData = {
          attachments: data.items ?? [],
          total: data.total,
          page: data.page,
          size: data.size,
          totalPages: data.total_pages,
          hasNext: data.has_next,
          hasPrevious: data.has_previous,
          links: response.metadata?.links ?? null,
        };

        updateAttachmentsPage({
          ...pageData,
          strategy: append ? 'append' : 'replace',
        });

        // Cache page 1 results
        if (targetPage === 1 && !append) {
          setCacheEntry(cacheKey, {
            ...pageData,
            fetchedAt: Date.now(),
          });
        }
      } catch (err) {
        // Don't set error if request was cancelled
        if (err instanceof Error && err.message === 'Request cancelled') {
          return;
        }

        const message =
          err instanceof Error
            ? err.message
            : 'Unable to load attachments right now.';
        setError(message, () => {
          void fetchPage(targetPage, append, undefined, skipCache);
        });
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [
      filters,
      pageSize,
      setError,
      setLoading,
      updateAttachmentsPage,
      getCacheEntry,
      setCacheEntry,
    ],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchPage(1, false, controller.signal).catch(() => {});

    return () => {
      controller.abort();
    };
  }, [fetchPage]);

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
    if (!hasNext || isLoading || !links?.next) {
      return;
    }

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
