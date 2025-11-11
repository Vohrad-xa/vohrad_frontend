import {useMutation, useQueryClient} from '@tanstack/react-query';
import {itemApi} from '@vohrad/api-client';
import type {ItemCreate, ItemUpdate, ItemLocationUpdate} from '@vohrad/types';

export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ItemCreate) => itemApi.createItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['items', 'list']});
    },
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({id, data}: {id: string; data: ItemUpdate}) =>
      itemApi.updateItem(id, data),
    onSuccess: (updatedItem, variables) => {
      // Update the specific item detail in the cache
      queryClient.setQueryData(['items', 'detail', variables.id], updatedItem);
      // Invalidate the item list to ensure it reflects any changes
      queryClient.invalidateQueries({queryKey: ['items', 'list']});
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => itemApi.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['items', 'list']});
    },
  });
}

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
