import {useQuery} from '@tanstack/react-query';
import {itemApi} from '@vohrad/api-client';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches the full details for a single item.
 * @param itemId The ID of the item to fetch.
 */
export function useFetchItem(itemId: string | null | undefined) {
  const queryKey = ['items', 'detail', itemId];

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!itemId) {
        // This should not happen if `enabled` is set correctly, but as a safeguard:
        throw new Error('Item ID is required to fetch item details.');
      }
      // The API call returns the full item detail object.
      return itemApi.getItemById(itemId);
    },
    // Only run the query if the itemId is a non-empty string.
    enabled: !!itemId,
    staleTime: STALE_TIME,
  });
}
