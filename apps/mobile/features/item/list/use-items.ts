import {useCallback, useEffect, useRef, useState} from 'react';
import {
  useItems,
  useFetchItems,
  useSearchItems,
  useFetchAttachmentUrls,
  useAttachmentUrls,
  useAuthStore,
} from '@vohrad/store';
import type {Item} from '@vohrad/types';

const DEFAULT_SEARCH_QUERY = '';
const MIN_SEARCH_LENGTH = 3;

export function useItemsManager() {
  const {items, total, page, size, hasNext, isLoading, error} = useItems();
  const imageUrls = useAttachmentUrls();
  const {isAuthenticated, tokens, _hasHydrated} = useAuthStore();

  // Actions
  const {fetchItems} = useFetchItems();
  const {searchItems} = useSearchItems();
  const {fetchAttachmentUrls} = useFetchAttachmentUrls();

  // Track whether we've attempted initial fetch to prevent infinite loops
  const hasAttemptedFetch = useRef(false);
  const activeQueryRef = useRef(DEFAULT_SEARCH_QUERY);
  const [isAppending, setIsAppending] = useState(false);

  const performFetchItems = useCallback(
    async (targetPage: number, pageSize: number, append: boolean) => {
      if (append) {
        setIsAppending(true);
      }
      try {
        await fetchItems(targetPage, pageSize, {append});
      } finally {
        if (append) {
          setIsAppending(false);
        }
      }
    },
    [fetchItems],
  );

  const performSearchItems = useCallback(
    async (
      queryValue: string,
      targetPage: number,
      pageSize: number,
      append: boolean,
    ) => {
      if (append) {
        setIsAppending(true);
      }
      try {
        await searchItems(queryValue, targetPage, pageSize, {append});
      } finally {
        if (append) {
          setIsAppending(false);
        }
      }
    },
    [searchItems],
  );

  // Initial fetch when authenticated and hydrated but only if store is empty
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

  // Fetch attachment URLs when items change
  useEffect(() => {
    if (items.length > 0) {
      fetchAttachmentUrls(items).catch(() => {});
    }
  }, [items, fetchAttachmentUrls]);

  // Search items with debounced query
  const search = useCallback(
    (query: string) => {
      if (!isAuthenticated || !tokens?.access_token) {
        return;
      }
      const trimmed = query.trim();
      if (trimmed.length >= MIN_SEARCH_LENGTH) {
        if (trimmed === activeQueryRef.current) {
          return;
        }
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

  // Refresh items
  const refresh = useCallback(() => {
    if (!isAuthenticated || !tokens?.access_token) {
      console.warn('Cannot refresh: not authenticated');
      return Promise.resolve();
    }
    if (activeQueryRef.current) {
      return performSearchItems(activeQueryRef.current, 1, size, false).catch(
        () => {},
      );
    }
    return performFetchItems(1, size, false).catch(() => {});
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
      return performSearchItems(
        activeQueryRef.current,
        nextPage,
        size,
        true,
      ).catch(() => {});
    }
    return performFetchItems(nextPage, size, true).catch(() => {});
  }, [
    hasNext,
    isLoading,
    isAppending,
    page,
    size,
    performFetchItems,
    performSearchItems,
  ]);

  // Get image URL for an item
  const getItemImageUrl = useCallback(
    (item: Item) => {
      return imageUrls[item.id] ? {uri: imageUrls[item.id]} : undefined;
    },
    [imageUrls],
  );

  return {
    // Data
    items,
    total,
    isLoading,
    error,
    hasItems: items.length > 0,
    isEmpty: !isLoading && items.length === 0 && !error,
    isLoadingMore: isAppending,
    canLoadMore: hasNext,
    loadMore,

    // Actions
    search,
    refresh,
    getItemImageUrl,
  };
}
