import {useMutation, useQueryClient} from '@tanstack/react-query';
import {itemApi} from '@vohrad/api-client';
import type {ItemCreate, ItemUpdate, ItemLocationUpdate} from '@vohrad/types';

/**
 * Mutation to create a new item.
 * Invalidates the item list query on success.
 */
export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ItemCreate) => itemApi.createItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['items', 'list']});
    },
  });
}

/**
 * Mutation to update an existing item.
 * Invalidates both the item list and the specific item's detail query.
 */
export function useUpdateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({id, data}: {id: string; data: ItemUpdate}) =>
      itemApi.updateItem(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({queryKey: ['items', 'list']});
      queryClient.invalidateQueries({
        queryKey: ['items', 'detail', variables.id],
      });
    },
  });
}

/**
 * Mutation to delete an item.
 * Invalidates the item list query on success.
 */
export function useDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => itemApi.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['items', 'list']});
    },
  });
}

/**
 * Mutation to update a specific location for an item.
 * Invalidates both the item list and the specific item's detail query.
 */
export function useUpdateItemLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemId,
      locationId,
      data,
    }: {
      itemId: string;
      locationId: string;
      data: ItemLocationUpdate;
    }) => itemApi.updateItemLocation(itemId, locationId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({queryKey: ['items', 'list']});
      queryClient.invalidateQueries({
        queryKey: ['items', 'detail', variables.itemId],
      });
    },
  });
}
