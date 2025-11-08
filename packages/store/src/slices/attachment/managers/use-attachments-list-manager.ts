import {useCallback, useEffect, useMemo, useState} from 'react';
import {attachmentApi, type ListAttachmentsParams} from '@vohrad/api-client';
import {useAuthStore} from '../../../store';
import {attachmentSelectors} from '../selectors';

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

  const attachments = useAuthStore(attachmentSelectors.attachments);
  const isLoading = useAuthStore(attachmentSelectors.isAttachmentLoading);
  const error = useAuthStore(attachmentSelectors.attachmentError);
  const retryCallback = useAuthStore(attachmentSelectors.retryCallback);
  const total = useAuthStore(attachmentSelectors.total);
  const page = useAuthStore(attachmentSelectors.page);
  const size = useAuthStore(attachmentSelectors.size);
  const totalPages = useAuthStore(attachmentSelectors.totalPages);
  const hasNext = useAuthStore(attachmentSelectors.hasNext);
  const hasPrevious = useAuthStore(attachmentSelectors.hasPrevious);
  const links = useAuthStore(attachmentSelectors.links);

  const updateAttachmentsPage = useAuthStore(
    attachmentSelectors.updateAttachmentsPage,
  );
  const clearAttachmentList = useAuthStore(
    attachmentSelectors.clearAttachmentList,
  );
  const setLoading = useAuthStore(attachmentSelectors.setLoading);
  const setError = useAuthStore(attachmentSelectors.setError);

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
    async (targetPage: number, append = false, signal?: AbortSignal) => {
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
        updateAttachmentsPage({
          attachments: data.items ?? [],
          total: data.total,
          page: data.page,
          size: data.size,
          totalPages: data.total_pages,
          hasNext: data.has_next,
          hasPrevious: data.has_previous,
          links: response.metadata?.links ?? null,
          strategy: append ? 'append' : 'replace',
        });
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
          void fetchPage(targetPage, append);
        });
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [filters, pageSize, setError, setLoading, updateAttachmentsPage],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchPage(1, false, controller.signal).catch(() => {});

    return () => {
      controller.abort();
    };
  }, [fetchPage]);

  const refresh = useCallback(async () => {
    if (links?.first) {
      await fetchByUrl(links.first, 'replace');
    } else {
      await fetchPage(1, false);
    }
  }, [fetchPage, fetchByUrl, links]);

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
