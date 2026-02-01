import {useCallback} from 'react';
import {
  useCreateItem as useCreateItemMutation,
  useUpdateItem as useUpdateItemMutation,
  useDeleteItem as useDeleteItemMutation,
} from '@sykamore/store';
import type {ItemCreate, ItemUpdate} from '@sykamore/types';

type UseItemMutationsResult = {
  createItem: (data: ItemCreate) => Promise<unknown>;
  updateItem: (id: string, data: ItemUpdate) => Promise<unknown>;
  deleteItem: (id: string) => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isPending: boolean;
};

/**
 * Hook for item CRUD operations.
 *
 * Wraps create, update, and delete mutations from @sykamore/store
 * and provides a unified interface for item mutations.
 */
export function useItemMutations(): UseItemMutationsResult {
  const createMutation = useCreateItemMutation();
  const updateMutation = useUpdateItemMutation();
  const deleteMutation = useDeleteItemMutation();

  const createItem = useCallback(
    async (data: ItemCreate) => {
      return createMutation.mutateAsync(data);
    },
    [createMutation],
  );

  const updateItem = useCallback(
    async (id: string, data: ItemUpdate) => {
      return updateMutation.mutateAsync({id, data});
    },
    [updateMutation],
  );

  const deleteItem = useCallback(
    async (id: string) => {
      await deleteMutation.mutateAsync(id);
    },
    [deleteMutation],
  );

  return {
    createItem,
    updateItem,
    deleteItem,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isPending:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
  };
}
