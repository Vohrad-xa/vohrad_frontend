import {useEffect, useMemo, useState} from 'react';
import {searchItemsLocally} from '@sykamore/store';
import type {Item} from '@sykamore/types';

type UseHybridItemSearchOptions = {
  items: Item[];
  searchQuery: string;
  onServerSearchNeeded: () => void;
  isUsingServerSearch: boolean;
};

export function useHybridItemSearch({
  items,
  searchQuery,
  onServerSearchNeeded,
  isUsingServerSearch,
}: UseHybridItemSearchOptions): Item[] {
  const filteredItems = useMemo(() => {
    const hasSearchQuery = searchQuery && searchQuery.trim().length > 0;

    if (!hasSearchQuery) {
      return items;
    }

    if (isUsingServerSearch) {
      return items;
    }

    const localResults = searchItemsLocally(items, searchQuery);
    return localResults;
  }, [items, searchQuery, isUsingServerSearch]);

  useEffect(() => {
    const hasQuery = searchQuery && searchQuery.trim().length > 0;
    const localFoundNothing =
      hasQuery && !isUsingServerSearch && filteredItems.length === 0;
    const hasItemsLoaded = items.length > 0;

    if (localFoundNothing && hasItemsLoaded) {
      onServerSearchNeeded();
    }
  }, [
    searchQuery,
    isUsingServerSearch,
    filteredItems.length,
    items.length,
    onServerSearchNeeded,
  ]);

  return filteredItems;
}

// server search state hook
export function useServerSearchState(searchQuery: string) {
  const [shouldUseServerSearch, setShouldUseServerSearch] = useState(false);

  // Reset to local search when query changes
  useEffect(() => {
    setShouldUseServerSearch(false);
  }, [searchQuery]);

  return {
    shouldUseServerSearch,
    enableServerSearch: () => setShouldUseServerSearch(true),
  };
}
