import {useCallback, useEffect, useRef, useState} from 'react';
import {resolveAttachmentUrl} from '@vohrad/api-client';
import {useAuthStore} from '../../../store';
import {buildODataFilter} from '../../../utils/odata-filter-builder';
import {useItems, useFetchItems, useSearchItems} from '../hooks';
import {itemSelectors} from '../selectors';
import type {ItemFilterState, Item, ItemDetail} from '@vohrad/types';

const DEFAULT_SEARCH_QUERY = '';
const MIN_SEARCH_LENGTH = 3;

export function useItemsManager() {
  const {items, total, page, size, hasNext, isLoading, error} = useItems();
  const {isAuthenticated, tokens, _hasHydrated} = useAuthStore();
  const setSelectedItem = useAuthStore(itemSelectors.setSelectedItem);

  const [filters, setFilters] = useState<ItemFilterState>({
    statuses: [],
    trackingModes: [],
    priceMin: null,
    priceMax: null,
    specifications: null,
  });

  const {fetchItems} = useFetchItems();
  const {searchItems} = useSearchItems();

  const hasAttemptedFetch = useRef(false);
  const activeQueryRef = useRef(DEFAULT_SEARCH_QUERY);
  const previousFiltersRef = useRef<string>(JSON.stringify(filters));
  const [isAppending, setIsAppending] = useState(false);

  const performFetchItems = useCallback(
    async (targetPage: number, pageSize: number, append: boolean) => {
      if (append) setIsAppending(true);

      try {
        const odataFilter = filters ? buildODataFilter(filters) : undefined;
        await fetchItems(targetPage, pageSize, {append, odataFilter});
      } finally {
        if (append) setIsAppending(false);
      }
    },
    [fetchItems, filters],
  );

  const performSearchItems = useCallback(
    async (
      queryValue: string,
      targetPage: number,
      pageSize: number,
      append: boolean,
    ) => {
      if (append) setIsAppending(true);

      try {
        await searchItems(queryValue, targetPage, pageSize, {append});
      } finally {
        if (append) setIsAppending(false);
      }
    },
    [searchItems],
  );

  useEffect(() => {
    if (
      _hasHydrated &&
      isAuthenticated &&
      tokens?.access_token &&
      !isLoading &&
      items.length === 0 &&
      !hasAttemptedFetch.current
    ) {
      hasAttemptedFetch.current = true;
      performFetchItems(1, size, false).catch(() => {});
    }

    if (!isAuthenticated) {
      hasAttemptedFetch.current = false;
      activeQueryRef.current = DEFAULT_SEARCH_QUERY;
      setIsAppending(false);
    }
  }, [
    _hasHydrated,
    isAuthenticated,
    tokens?.access_token,
    isLoading,
    items.length,
    size,
    performFetchItems,
  ]);

  useEffect(() => {
    if (!isAuthenticated || !tokens?.access_token || !_hasHydrated) {
      return;
    }

    const currentFilterString = JSON.stringify(filters);
    if (previousFiltersRef.current === currentFilterString) {
      return;
    }

    previousFiltersRef.current = currentFilterString;

    if (hasAttemptedFetch.current) {
      if (activeQueryRef.current) {
        performSearchItems(activeQueryRef.current, 1, size, false).catch(
          () => {},
        );
      } else {
        performFetchItems(1, size, false).catch(() => {});
      }
    }
  }, [
    filters,
    isAuthenticated,
    tokens?.access_token,
    _hasHydrated,
    performFetchItems,
    performSearchItems,
    size,
  ]);

  const search = useCallback(
    (query: string) => {
      if (!isAuthenticated || !tokens?.access_token) return;

      const trimmed = query.trim();

      if (trimmed.length >= MIN_SEARCH_LENGTH) {
        if (trimmed === activeQueryRef.current) return;

        activeQueryRef.current = trimmed;
        performSearchItems(trimmed, 1, size, false).catch(() => {});
        return;
      }

      if (activeQueryRef.current) {
        activeQueryRef.current = DEFAULT_SEARCH_QUERY;
        performFetchItems(1, size, false).catch(() => {});
      }
    },
    [
      performSearchItems,
      performFetchItems,
      isAuthenticated,
      tokens?.access_token,
      size,
    ],
  );

  const refresh = useCallback(() => {
    if (!isAuthenticated || !tokens?.access_token) {
      return Promise.resolve();
    }

    if (activeQueryRef.current) {
      return performSearchItems(activeQueryRef.current, 1, size, false);
    }

    return performFetchItems(1, size, false);
  }, [
    performFetchItems,
    performSearchItems,
    isAuthenticated,
    tokens?.access_token,
    size,
  ]);

  const loadMore = useCallback(() => {
    if (!hasNext || isLoading || isAppending) {
      return Promise.resolve();
    }

    const nextPage = page + 1;

    if (activeQueryRef.current) {
      return performSearchItems(activeQueryRef.current, nextPage, size, true);
    }

    return performFetchItems(nextPage, size, true);
  }, [
    hasNext,
    isLoading,
    isAppending,
    page,
    size,
    performFetchItems,
    performSearchItems,
  ]);

  const selectItem = useCallback(
    (id: string) => {
      const listItem = items.find((candidate) => candidate.id === id);
      if (!listItem) {
        return;
      }

      const current = useAuthStore.getState().selectedItem;
      const next: ItemDetail = {
        ...listItem,
        attachments:
          current && current.id === id ? (current.attachments ?? null) : null,
        locations:
          current && current.id === id ? (current.locations ?? null) : null,
      } as ItemDetail;

      setSelectedItem(next);
    },
    [items, setSelectedItem],
  );

  const getItemImageUrl = useCallback((item: Item) => {
    const url = item.thumbnail?.download_url;
    if (!url) return undefined;

    const resolved = url.startsWith('/') ? resolveAttachmentUrl(url) : url;
    return {uri: resolved};
  }, []);

  return {
    items,
    total,
    isLoading,
    error,
    hasItems: items.length > 0,
    isEmpty: !isLoading && items.length === 0 && !error,
    isLoadingMore: isAppending,
    canLoadMore: hasNext,
    loadMore,
    search,
    refresh,
    getItemImageUrl,
    filters,
    setFilters,
    selectItem,
  };
}
