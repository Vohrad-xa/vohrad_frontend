import {useQuery} from '@tanstack/react-query';
import {itemApi} from '@sykamore/api-client';

const STALE_TIME = 5 * 60 * 1000;

export function useFetchItem(itemId: string | null | undefined) {
  const queryKey = ['items', 'detail', itemId];

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!itemId) {
        // Safeguard:
        throw new Error('Item ID is required to fetch item details.');
      }
      return itemApi.getItemById(itemId);
    },
    enabled: !!itemId,
    staleTime: STALE_TIME,
  });
}
