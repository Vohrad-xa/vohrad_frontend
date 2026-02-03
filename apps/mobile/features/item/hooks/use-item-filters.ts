import {useCallback} from 'react';
import {useItemFiltersManager, useSetPendingFilters} from '@sykamore/store';
import type {ItemFilterState} from '@sykamore/types';

type UseItemFiltersOptions = {
  initialFilters?: ItemFilterState;
};

export const DEFAULT_ITEM_FILTERS: ItemFilterState = {
  statuses: [],
  trackingModes: [],
  priceMin: null,
  priceMax: null,
};

type UseItemFiltersResult = {
  filters: ItemFilterState;
  toggleFilter: <T extends keyof ItemFilterState>(
    filterName: T,
    value: ItemFilterState[T] extends Array<infer U> | undefined ? U : never,
  ) => void;
  updatePriceMin: (value: number | null) => void;
  updatePriceMax: (value: number | null) => void;
  resetFilters: () => void;
  setFilters: (filters: ItemFilterState) => void;
  saveFilters: (filters?: ItemFilterState) => void;
  hasActiveFilters: boolean;
};

/**
 * Hook for managing item filter state.
 *
 * Consumes useItemFiltersManager from @sykamore/store and provides
 * a clean interface for filter operations with computed active state.
 */
export function useItemFilters(
  options: UseItemFiltersOptions = {},
): UseItemFiltersResult {
  const {initialFilters = DEFAULT_ITEM_FILTERS} = options;

  const {
    filters,
    toggleFilter,
    updatePriceMin,
    updatePriceMax,
    resetFilters,
    setFilters,
  } = useItemFiltersManager(initialFilters);

  const setPendingFilters = useSetPendingFilters();

  const saveFilters = useCallback(
    (nextFilters?: ItemFilterState) => {
      setPendingFilters(nextFilters ?? filters);
    },
    [filters, setPendingFilters],
  );

  const hasActiveFilters = useCallback(() => {
    const hasStatuses =
      Array.isArray(filters.statuses) && filters.statuses.length > 0;
    const hasTrackingModes =
      Array.isArray(filters.trackingModes) && filters.trackingModes.length > 0;
    const hasPriceMin = filters.priceMin !== null;
    const hasPriceMax = filters.priceMax !== null;

    return hasStatuses || hasTrackingModes || hasPriceMin || hasPriceMax;
  }, [filters])();

  return {
    filters,
    toggleFilter,
    updatePriceMin,
    updatePriceMax,
    resetFilters,
    setFilters,
    saveFilters,
    hasActiveFilters,
  };
}
