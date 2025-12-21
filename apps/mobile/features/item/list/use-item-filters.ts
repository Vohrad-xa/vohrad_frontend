import {useEffect, useMemo, useState} from 'react';
import {
  usePendingFilters,
  useClearPendingFilters,
  buildODataFilter,
} from '@sykamore/store';
import type {ItemFilterState} from '@sykamore/types';

type UseItemFiltersOptions = {
  urlParams?: string;
  searchQuery?: string;
};

export function useItemFilters(options?: UseItemFiltersOptions) {
  const {urlParams, searchQuery} = options ?? {};

  // Local state for filters
  const [filters, setFilters] = useState<ItemFilterState>({
    statuses: undefined,
    trackingModes: undefined,
    priceMin: null,
    priceMax: null,
    specifications: undefined,
  });

  const pendingFilters = usePendingFilters();
  const clearPendingFilters = useClearPendingFilters();

  // Apply filters from URL params
  useEffect(() => {
    if (urlParams) {
      try {
        const parsedFilters = JSON.parse(
          decodeURIComponent(urlParams),
        ) as ItemFilterState;
        setFilters(parsedFilters);
      } catch (error) {
        console.error('Failed to parse filters from params:', error);
      }
    }
  }, [urlParams]);

  // Apply filters from modal when available
  useEffect(() => {
    if (pendingFilters) {
      setFilters(pendingFilters);
      clearPendingFilters();
    }
  }, [pendingFilters, clearPendingFilters]);

  // Build OData filter string
  const odataFilter = useMemo(() => {
    return buildODataFilter(filters, searchQuery);
  }, [filters, searchQuery]);

  return {
    filters,
    odataFilter,
  };
}
