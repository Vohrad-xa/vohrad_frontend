import {useMutation, useQueryClient} from '@tanstack/react-query';
import {userApi} from '@sykamore/api-client';
import type {User, UserUpdateData} from '@sykamore/types';
import {useAuthStore} from '../../../store';
import {buildUserProfileQueryKey} from './use-fetch-user-profile';

/**
 * Updates the tenant-scoped user profile (PUT /users/profile).
 * On success, updates the TanStack Query cache directly to avoid a refetch.
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const selectedTenantId = useAuthStore((state) => state.selectedTenantId);

  const {mutateAsync: updateProfile, isPending: isLoading} = useMutation({
    mutationFn: (data: UserUpdateData) => userApi.updateUserProfile(data),
    onSuccess: (updatedProfile: User) => {
      if (!selectedTenantId) {
        return;
      }

      queryClient.setQueryData<User>(
        buildUserProfileQueryKey(selectedTenantId),
        updatedProfile,
      );

      useAuthStore.getState().updateUser({
        email: updatedProfile.email,
        first_name: updatedProfile.first_name ?? undefined,
        last_name: updatedProfile.last_name ?? undefined,
        email_verified_at: updatedProfile.email_verified_at ?? undefined,
      });
    },
    onError: (err: unknown, data: UserUpdateData) => {
      const message =
        err instanceof Error ? err.message : 'Failed to update profile';
      const retry = () => updateProfile(data);
      import('../../../store').then(({useAuthStore}) => {
        useAuthStore.setState({error: message, retryCallback: retry});
      });
    },
  });

  return {updateProfile, isLoading};
}
