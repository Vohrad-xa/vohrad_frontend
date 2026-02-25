import {useQuery} from '@tanstack/react-query';
import {userApi} from '@sykamore/api-client';
import type {User} from '@sykamore/types';
import {shallow} from 'zustand/shallow';
import {useAuthStore} from '../../../store';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export type UserProfileQueryKey = readonly ['users', 'profile', string | null];


export function buildUserProfileQueryKey(
  tenantId: string | null,
): UserProfileQueryKey {
  return ['users', 'profile', tenantId] as const;
}


/**
 * Fetches the full tenant-scoped user profile (GET /users/profile).
 * Distinct from the auth store's Identity (MeProfileResponse) — includes
 * role, address, phone, and other extended fields.
 */
export function useFetchUserProfile(enabled = true) {
  const {isAuthenticated, hasHydrated, selectedTenantId} = useAuthStore(
    (state) => ({
      isAuthenticated: state.isAuthenticated,
      hasHydrated: state._hasHydrated,
      selectedTenantId: state.selectedTenantId,
    }),
    shallow,
  );

  return useQuery<User, Error>({
    queryKey: buildUserProfileQueryKey(selectedTenantId),
    queryFn: () => userApi.getUserProfile(),
    enabled: enabled && isAuthenticated && hasHydrated && !!selectedTenantId,
    staleTime: STALE_TIME,
  });
}
