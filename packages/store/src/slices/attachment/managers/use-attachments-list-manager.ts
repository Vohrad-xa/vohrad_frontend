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

  const updateAttachmentsPage = useAuthStore(
    attachmentSelectors.updateAttachmentsPage,
  );
  const clearAttachmentList = useAuthStore(
    attachmentSelectors.clearAttachmentList,
  );
  const setLoading = useAuthStore(attachmentSelectors.setLoading);
  const setError = useAuthStore(attachmentSelectors.setError);

  const fetchPage = useCallback(
    async (targetPage: number, append = false) => {
      setLoading(true);
      setError(null);

      try {
        const response = await attachmentApi.listAttachments({
          ...filters,
          page: targetPage,
          size: pageSize,
        });

        updateAttachmentsPage({
          attachments: response.items ?? [],
          total: response.total,
          page: response.page,
          size: response.size,
          totalPages: response.total_pages,
          hasNext: response.has_next,
          hasPrevious: response.has_previous,
          strategy: append ? 'append' : 'replace',
        });
      } catch (err) {
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
    fetchPage(1, false).catch(() => {});
  }, [fetchPage]);

  const refresh = useCallback(async () => {
    await fetchPage(1, false);
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (!hasNext || isLoading) {
      return;
    }
    await fetchPage(page + 1, true);
  }, [fetchPage, hasNext, isLoading, page]);

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
