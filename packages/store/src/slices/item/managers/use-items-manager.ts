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
  const {items, total, hasNext, isLoading, error, links} = useItems();
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
    async (targetPage: number, pageSize: number) => {
      const odataFilter = filters ? buildODataFilter(filters) : undefined;
      await fetchItems(targetPage, pageSize, {odataFilter});
    },
    [fetchItems, filters],
  );

  const performSearchItems = useCallback(
    async (queryValue: string, targetPage: number, pageSize: number) => {
      await searchItems(queryValue, targetPage, pageSize);
    },
    [searchItems],
  );

  useEffect(() => {
    const controller = new AbortController();

    if (
      _hasHydrated &&
      isAuthenticated &&
      tokens?.access_token &&
      !isLoading &&
      items.length === 0 &&
      !hasAttemptedFetch.current
    ) {
      hasAttemptedFetch.current = true;
      const size = 20;
      const odataFilter = filters ? buildODataFilter(filters) : undefined;
      fetchItems(1, size, {odataFilter, signal: controller.signal}).catch(
        () => {},
      );
    }

    if (!isAuthenticated) {
      hasAttemptedFetch.current = false;
      activeQueryRef.current = DEFAULT_SEARCH_QUERY;
      setIsAppending(false);
    }

    return () => {
      controller.abort();
    };
  }, [
    _hasHydrated,
    isAuthenticated,
    tokens?.access_token,
    items.length,
    fetchItems,
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
      const size = 20;
      if (activeQueryRef.current) {
        performSearchItems(activeQueryRef.current, 1, size).catch(() => {});
      } else {
        performFetchItems(1, size).catch(() => {});
      }
    }
  }, [
    filters,
    isAuthenticated,
    tokens?.access_token,
    _hasHydrated,
    performFetchItems,
    performSearchItems,
  ]);

  const search = useCallback(
    (query: string) => {
      if (!isAuthenticated || !tokens?.access_token) return;

      const trimmed = query.trim();
      const size = 20;

      if (trimmed.length >= MIN_SEARCH_LENGTH) {
        if (trimmed === activeQueryRef.current) return;

        activeQueryRef.current = trimmed;
        performSearchItems(trimmed, 1, size).catch(() => {});
        return;
      }

      if (activeQueryRef.current) {
        activeQueryRef.current = DEFAULT_SEARCH_QUERY;
        performFetchItems(1, size).catch(() => {});
      }
    },
    [
      performSearchItems,
      performFetchItems,
      isAuthenticated,
      tokens?.access_token,
    ],
  );

  const refresh = useCallback(() => {
    if (!isAuthenticated || !tokens?.access_token) {
      return Promise.resolve();
    }

    // Use links.first if available, otherwise fetch page 1
    if (links?.first) {
      return fetchItems(links.first);
    }

    const size = 20;
    if (activeQueryRef.current) {
      return performSearchItems(activeQueryRef.current, 1, size);
    }

    return performFetchItems(1, size);
  }, [
    performFetchItems,
    performSearchItems,
    fetchItems,
    isAuthenticated,
    tokens?.access_token,
    links,
  ]);

  const loadMore = useCallback(() => {
    if (!hasNext || isLoading || isAppending || !links?.next) {
      return Promise.resolve();
    }

    setIsAppending(true);

    const loadPromise = fetchItems(links.next, {append: true}).finally(() => {
      setIsAppending(false);
    });

    return loadPromise;
  }, [hasNext, isLoading, isAppending, links, fetchItems]);

  const selectItem = useCallback(
    (id: string) => {
      const listItem = items.find((candidate) => candidate.id === id);
      if (!listItem) {
        return;
      }

      const current = useAuthStore.getState().selectedItem;
      const next: ItemDetail = {
        ...listItem,
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
