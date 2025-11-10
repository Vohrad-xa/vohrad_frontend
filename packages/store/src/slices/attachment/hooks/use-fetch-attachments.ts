import {useCallback} from 'react';
import {attachmentApi, type ListAttachmentsParams} from '@vohrad/api-client';
import {useAuthStore} from '../../../store';
import {attachmentSelectors} from '../selectors';

export function useFetchAttachments() {
  const updateAttachmentsPage = useAuthStore(
    attachmentSelectors.updateAttachmentsPage,
  );
  const setLoading = useAuthStore(attachmentSelectors.setLoading);
  const setError = useAuthStore(attachmentSelectors.setError);

  const fetchAttachments = useCallback(
    async (
      urlOrParams: string | ListAttachmentsParams,
      options?: {append?: boolean; signal?: AbortSignal},
    ): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        let response;
        let append = options?.append ?? false;
        const signal = options?.signal;

        // If it's a URL string, fetch by URL
        if (typeof urlOrParams === 'string') {
          response = await attachmentApi.listAttachments(urlOrParams);
        } else {
          // Otherwise, fetch by params
          response = await attachmentApi.listAttachments(urlOrParams);
        }

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
        const retry = () => fetchAttachments(urlOrParams, options);

        // Set error on local attachment slice
        setError(message, retry);

        // Set error on global auth slice for ErrorHandlerProvider
        useAuthStore.setState({error: message, retryCallback: retry});

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [updateAttachmentsPage, setLoading, setError],
  );

  return {fetchAttachments};
}
