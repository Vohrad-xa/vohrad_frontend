import {useMutation, useQueryClient} from '@tanstack/react-query';
import {userApi} from '@vohrad/api-client';
import type {UserCreateData} from '@vohrad/types';

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UserCreateData) => userApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['users', 'list']});
    },
  });
}
