import {useState, useCallback} from 'react';
import {itemApi} from '@vohrad/api-client';
import {useAuthStore} from '../../../store';
import {itemSelectors} from '../selectors';
import type {
  Item,
  ItemCreate,
  ItemUpdate,
  ItemLocationUpdate,
} from '@vohrad/types';

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

export function useUpdateItemLocation() {
  const [isLoading, setIsLoading] = useState(false);
  const updateItemLocation = useAuthStore(itemSelectors.updateItemLocation);
  const setError = useAuthStore(itemSelectors.setError);

  const updateLocation = useCallback(
    async (
      itemId: string,
      locationId: string,
      data: ItemLocationUpdate,
    ): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        await itemApi.updateItemLocation(itemId, locationId, data);
        if (data.quantity !== undefined) {
          updateItemLocation(locationId, data.quantity);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to update item location';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [updateItemLocation, setError],
  );

  return {
    updateLocation,
    isLoading,
  };
}
