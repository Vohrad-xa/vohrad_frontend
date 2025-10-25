import {useState, useCallback} from 'react';
import {itemApi} from '@vohrad/api-client';
import {useAuthStore} from '../../store';
import {itemSelectors} from './selectors';
import type {Item, ItemCreate, ItemUpdate} from '@vohrad/types';

export function useItems() {
  const items = useAuthStore(itemSelectors.items);
  const total = useAuthStore(itemSelectors.total);
  const page = useAuthStore(itemSelectors.page);
  const size = useAuthStore(itemSelectors.size);
  const totalPages = useAuthStore(itemSelectors.totalPages);
  const hasNext = useAuthStore(itemSelectors.hasNext);
  const hasPrevious = useAuthStore(itemSelectors.hasPrevious);
  const isLoading = useAuthStore(itemSelectors.isLoading);
  const error = useAuthStore(itemSelectors.error);

  return {
    items,
    total,
    page,
    size,
    totalPages,
    hasNext,
    hasPrevious,
    isLoading,
    error,
  };
}

export function useItemDetails() {
  const selectedItem = useAuthStore(itemSelectors.selectedItem);
  const isLoading = useAuthStore(itemSelectors.isLoading);
  const error = useAuthStore(itemSelectors.error);

  return {
    item: selectedItem,
    isLoading,
    error,
  };
}

export function useFetchItems() {
  const updatePage = useAuthStore(itemSelectors.updatePage);
  const setLoading = useAuthStore(itemSelectors.setLoading);
  const setError = useAuthStore(itemSelectors.setError);

  const fetchItems = useCallback(
    async (
      page: number,
      size: number,
      options?: {append?: boolean},
    ): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const response = await itemApi.getItems(page, size);
        const {
          items: pageItems,
          total,
          page: currentPage,
          size: currentSize,
          total_pages,
          has_next,
          has_previous,
        } = response.data;
        updatePage({
          items: pageItems,
          total,
          page: currentPage,
          size: currentSize,
          totalPages: total_pages,
          hasNext: has_next,
          hasPrevious: has_previous,
          strategy: options?.append ? 'append' : 'replace',
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to fetch items';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [updatePage, setLoading, setError],
  );

  return {fetchItems};
}

export function useSearchItems() {
  const updatePage = useAuthStore(itemSelectors.updatePage);
  const setLoading = useAuthStore(itemSelectors.setLoading);
  const setError = useAuthStore(itemSelectors.setError);

  const searchItems = useCallback(
    async (
      query: string,
      page: number,
      size: number,
      options?: {append?: boolean},
    ): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const response = await itemApi.searchItems(query, page, size);
        const {
          items: pageItems,
          total,
          page: currentPage,
          size: currentSize,
          total_pages,
          has_next,
          has_previous,
        } = response.data;
        updatePage({
          items: pageItems,
          total,
          page: currentPage,
          size: currentSize,
          totalPages: total_pages,
          hasNext: has_next,
          hasPrevious: has_previous,
          strategy: options?.append ? 'append' : 'replace',
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to search items';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [updatePage, setLoading, setError],
  );

  return {searchItems};
}

export function useFetchItemDetail() {
  const setSelectedItem = useAuthStore(itemSelectors.setSelectedItem);
  const setLoading = useAuthStore(itemSelectors.setLoading);
  const setError = useAuthStore(itemSelectors.setError);

  const fetchItemDetail = useCallback(
    async (id: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const item = await itemApi.getItemById(id);
        setSelectedItem(item);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to fetch item details';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setSelectedItem, setLoading, setError],
  );

  return {fetchItemDetail};
}

export function useCreateItem() {
  const [isLoading, setIsLoading] = useState(false);
  const addItem = useAuthStore(itemSelectors.addItem);
  const setError = useAuthStore(itemSelectors.setError);

  const createItem = useCallback(
    async (data: ItemCreate): Promise<Item> => {
      setIsLoading(true);
      setError(null);

      try {
        const newItem = await itemApi.createItem(data);
        addItem(newItem);
        return newItem;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to create item';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [addItem, setError],
  );

  return {
    createItem,
    isLoading,
  };
}

export function useUpdateItem() {
  const [isLoading, setIsLoading] = useState(false);
  const updateItemInList = useAuthStore(itemSelectors.updateItemInList);
  const setError = useAuthStore(itemSelectors.setError);

  const updateItem = useCallback(
    async (id: string, data: ItemUpdate): Promise<Item> => {
      setIsLoading(true);
      setError(null);

      try {
        const updatedItem = await itemApi.updateItem(id, data);
        updateItemInList(id, updatedItem);
        return updatedItem;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to update item';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [updateItemInList, setError],
  );

  return {
    updateItem,
    isLoading,
  };
}

export function useDeleteItem() {
  const [isLoading, setIsLoading] = useState(false);
  const removeItem = useAuthStore(itemSelectors.removeItem);
  const setError = useAuthStore(itemSelectors.setError);

  const deleteItem = useCallback(
    async (id: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        await itemApi.deleteItem(id);
        removeItem(id);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to delete item';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [removeItem, setError],
  );

  return {
    deleteItem,
    isLoading,
  };
}
