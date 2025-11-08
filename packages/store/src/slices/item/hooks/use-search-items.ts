import {useCallback} from 'react';
import {itemApi} from '@vohrad/api-client';
import {useAuthStore} from '../../../store';
import {itemSelectors} from '../selectors';

export function useSearchItems() {
  const updatePage = useAuthStore(itemSelectors.updatePage);
  const setLoading = useAuthStore(itemSelectors.setLoading);
  const setError = useAuthStore(itemSelectors.setError);

  const searchItems = useCallback(
    async (
      urlOrQuery: string,
      pageOrOptions?: number | {append?: boolean},
      size?: number,
    ): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        let response;
        let append = false;

        // If it's a URL (contains http or starts with /items)
        if (urlOrQuery.startsWith('http') || urlOrQuery.startsWith('/items')) {
          response = await itemApi.searchItems(urlOrQuery);
          append = (pageOrOptions as {append?: boolean})?.append ?? false;
        } else {
          // Otherwise, it's a search query
          const query = urlOrQuery;
          const page = pageOrOptions as number;
          response = await itemApi.searchItems(query, page, size);
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
        const message =
          err instanceof Error ? err.message : 'Failed to search items';
        setError(message, () => searchItems(urlOrQuery, pageOrOptions, size));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [updatePage, setLoading, setError],
  );

  return {searchItems};
}
