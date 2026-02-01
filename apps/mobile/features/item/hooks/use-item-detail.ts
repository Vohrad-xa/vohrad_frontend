import {useItemDetailManager} from '@sykamore/store';
import type {Item, ItemLocationUpdate} from '@sykamore/types';

type UseItemDetailOptions = {
  itemId: string | null | undefined;
};

type UseItemDetailResult = {
  item: Item | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  getItemImageUrl: () => {uri: string} | undefined;
  updateLocation: (
    itemLocationId: string,
    data: ItemLocationUpdate,
  ) => Promise<unknown>;
  isUpdatingLocation: boolean;
};

/**
 * Hook for fetching and managing a single item's details.
 *
 * Consumes useItemDetailManager from @sykamore/store and provides
 * a clean interface for item detail operations including location updates.
 */
export function useItemDetail(
  options: UseItemDetailOptions,
): UseItemDetailResult {
  const {itemId} = options;

  const {
    item,
    isLoading,
    error,
    refresh,
    getItemImageUrl,
    updateLocation,
    isUpdatingLocation,
  } = useItemDetailManager(itemId);

  return {
    item,
    isLoading,
    error,
    refresh,
    getItemImageUrl,
    updateLocation,
    isUpdatingLocation,
  };
}
