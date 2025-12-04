import {useMutation, useQueryClient} from '@tanstack/react-query';
import {roleApi} from '@vohrad/api-client';
import type {RoleCreate, RoleUpdate} from '@vohrad/types';

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RoleCreate) => roleApi.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['roles', 'list']});
      queryClient.invalidateQueries({queryKey: ['roles', 'active']});
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({id, data}: {id: string; data: RoleUpdate}) =>
      roleApi.updateRole(id, data),
    onSuccess: (role, variables) => {
      queryClient.setQueryData(['roles', 'detail', variables.id], role);
      queryClient.invalidateQueries({queryKey: ['roles', 'list']});
      queryClient.invalidateQueries({queryKey: ['roles', 'active']});
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({id, etag}: {id: string; etag: string}) =>
      roleApi.deleteRole(id, etag),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({queryKey: ['roles', 'list']});
      queryClient.invalidateQueries({queryKey: ['roles', 'active']});
      queryClient.invalidateQueries({
        queryKey: ['roles', 'detail', variables.id],
      });
    },
  });
}

export function useActivateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => roleApi.activateRole(id),
    onSuccess: (role, roleId) => {
      queryClient.setQueryData(['roles', 'detail', roleId], role);
      queryClient.invalidateQueries({queryKey: ['roles', 'list']});
      queryClient.invalidateQueries({queryKey: ['roles', 'active']});
    },
  });
}

export function useDeactivateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => roleApi.deactivateRole(id),
    onSuccess: (role, roleId) => {
      queryClient.setQueryData(['roles', 'detail', roleId], role);
      queryClient.invalidateQueries({queryKey: ['roles', 'list']});
      queryClient.invalidateQueries({queryKey: ['roles', 'active']});
    },
  });
}
