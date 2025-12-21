import {useCallback, useState} from 'react';
import {type ItemFilterState} from '@sykamore/types';

export function useItemFiltersManager(initialFilters: ItemFilterState) {
  const [filters, setFilters] = useState<ItemFilterState>(initialFilters);

  const toggleFilter = useCallback(
    <T extends keyof ItemFilterState>(
      filterName: T,
      value: ItemFilterState[T] extends Array<infer U> | undefined ? U : never,
    ) => {
      setFilters((prevFilters) => {
        const existingValues = prevFilters[filterName];
        const newValues = Array.isArray(existingValues)
          ? [...existingValues]
          : [];
        const index = newValues.indexOf(value);

        if (index > -1) {
          newValues.splice(index, 1);
        } else {
          newValues.push(value);
        }

        return {
          ...prevFilters,
          [filterName]: newValues,
        };
      });
    },
    [],
  );

  const updatePriceMin = useCallback((value: number | null) => {
    setFilters((prev) => ({...prev, priceMin: value}));
  }, []);

  const updatePriceMax = useCallback((value: number | null) => {
    setFilters((prev) => ({...prev, priceMax: value}));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  return {
    filters,
    toggleFilter,
    updatePriceMin,
    updatePriceMax,
    resetFilters,
    setFilters,
  };
}
