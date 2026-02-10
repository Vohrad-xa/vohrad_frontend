import {useMemo} from 'react';
import {useItemFiltersManager} from '@sykamore/store';
import type {ItemFilterState} from '@sykamore/types';

type UseItemFiltersOptions = {
  initialFilters?: ItemFilterState;
};

export const DEFAULT_ITEM_FILTERS: ItemFilterState = {
  statuses: [],
  trackingModes: [],
  unitIds: [],
  priceMin: null,
  priceMax: null,
};

/** Count individual active filter selections. */
export function countActiveFilters(filters: ItemFilterState): number {
  let count = 0;
  if (Array.isArray(filters.statuses)) count += filters.statuses.length;
  if (Array.isArray(filters.trackingModes))
    count += filters.trackingModes.length;
  if (Array.isArray(filters.unitIds)) count += filters.unitIds.length;
  if (filters.priceMin !== null && filters.priceMin !== undefined) count++;
  if (filters.priceMax !== null && filters.priceMax !== undefined) count++;
  return count;
}

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
  hasActiveFilters: boolean;
  activeFilterCount: number;
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

  const activeFilterCount = useMemo(
    () => countActiveFilters(filters),
    [filters],
  );

  const hasActiveFilters = activeFilterCount > 0;

  return {
    filters,
    toggleFilter,
    updatePriceMin,
    updatePriceMax,
    resetFilters,
    setFilters,
    hasActiveFilters,
    activeFilterCount,
  };
}
