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
      queryClient.setQueryData(['items', 'detail', variables.id], updatedItem);
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
    onSuccess: (_, {itemId, locationId, data}) => {
      queryClient.setQueryData(['items', 'detail', itemId], (old: any) => {
        if (!old) return old;
        // Update the specific location
        const updatedLocations = old.locations?.map((loc: any) =>
          loc.id === locationId ? {...loc, quantity: data.quantity} : loc,
        );
        // Recalculate total quantity
        const totalQuantity = updatedLocations
          ?.reduce(
            (sum: number, loc: any) => sum + Number(loc.quantity || 0),
            0,
          )
          ?.toString();

        return {
          ...old,
          locations: updatedLocations,
          total_quantity: totalQuantity,
        };
      });
      queryClient.invalidateQueries({queryKey: ['items', 'list']});
    },
  });
}
