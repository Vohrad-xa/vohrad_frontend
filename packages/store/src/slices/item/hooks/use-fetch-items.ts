import {useCallback} from 'react';
import {itemApi} from '@vohrad/api-client';
import {useAuthStore} from '../../../store';
import {itemSelectors} from '../selectors';

export function useFetchItems() {
  const updatePage = useAuthStore(itemSelectors.updatePage);
  const setLoading = useAuthStore(itemSelectors.setLoading);
  const setError = useAuthStore(itemSelectors.setError);

  const fetchItems = useCallback(
    async (
      urlOrPage: string | number,
      sizeOrOptions?: number | {append?: boolean; signal?: AbortSignal},
      filterOptions?: {odataFilter?: string; signal?: AbortSignal},
    ): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        let response;
        let append = false;
        let signal: AbortSignal | undefined;

        // If it's a URL string, fetch by URL
        if (typeof urlOrPage === 'string') {
          response = await itemApi.getItems(urlOrPage);
          const options = sizeOrOptions as
            | {append?: boolean; signal?: AbortSignal}
            | undefined;
          append = options?.append ?? false;
          signal = options?.signal;
        } else {
          // Otherwise, fetch by page/size/filter
          const page = urlOrPage;
          const size = sizeOrOptions as number;
          signal = filterOptions?.signal;
          response = await itemApi.getItems(
            page,
            size,
            filterOptions?.odataFilter,
          );
        }

        // Don't update state if request was aborted
        if (signal?.aborted) {
          return;
        }

        const {
          items: pageItems,
          total,
          page: currentPage,
          size: currentSize,
          total_pages,
          has_next,
          has_previous,
        } = response.data;

        updatePage({
          items: pageItems,
          total,
          page: currentPage,
          size: currentSize,
          totalPages: total_pages,
          hasNext: has_next,
          hasPrevious: has_previous,
          links: response.metadata?.links ?? null,
          strategy: append ? 'append' : 'replace',
        });
      } catch (err) {
        // Don't set error if request was cancelled
        if (err instanceof Error && err.message === 'Request cancelled') {
          return;
        }

        const message =
          err instanceof Error ? err.message : 'Failed to fetch items';
        const retry = () => fetchItems(urlOrPage, sizeOrOptions, filterOptions);
        setError(message, retry);
        useAuthStore.setState({error: message, retryCallback: retry});
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [updatePage, setLoading, setError],
  );

  return {fetchItems};
}
