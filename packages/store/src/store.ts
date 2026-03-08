import {createWithEqualityFn} from 'zustand/traditional';
import {persist, createJSONStorage} from 'zustand/middleware';
import {createAuthSlice, type AuthSlice} from './slices/auth/slice';
import {createTenantSlice, type TenantSlice} from './slices/tenant/slice';
import {createSystemSlice, type SystemSlice} from './slices/system/slice';
import {createFilterSlice, type FilterSlice} from './slices/filter/slice';
import {sanitizeUser, redactTokens} from './utils/sanitizers';
import {getPersistBackend} from './utils/storage';
import {httpClient} from '@sykamore/api-client';
import {validateAuthPersistedStateData, type AuthTokens} from '@sykamore/types';

export const AUTH_PERSIST_KEY = 'sykamore-auth';

export type StoreState = AuthSlice &
  TenantSlice &
  SystemSlice &
  FilterSlice & {
    _hasHydrated: boolean;
  };

export const useAuthStore = createWithEqualityFn<StoreState>()(
  persist(
    (set, get, store) => ({
      ...createAuthSlice(set, get, store),
      ...createTenantSlice(set, get, store),
      ...createSystemSlice(set, get, store),
      ...createFilterSlice(set, get, store),
      _hasHydrated: false,
    }),
    {
      name: AUTH_PERSIST_KEY,
      storage: createJSONStorage(() => ({
        getItem: (key: string) => getPersistBackend().getItem(key),
        setItem: (key: string, value: string) =>
          getPersistBackend().setItem(key, value),
        removeItem: (key: string) => getPersistBackend().removeItem(key),
      })),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const authResult = validateAuthPersistedStateData({
            user: state.user,
            tokens: state.tokens,
            isAuthenticated: state.isAuthenticated,
            intendedRoute: state.intendedRoute,
            isLoading: state.isLoading,
            error: state.error,
          });

          if (!authResult.success) {
            httpClient.setAccessToken(null);
            httpClient.setTenantId(null);

            useAuthStore.setState({
              user: null,
              tokens: null,
              isAuthenticated: false,
              intendedRoute: null,
              isLoading: false,
              error: null,
              retryCallback: null,
              selectedTenantId: null,
              memberships: [],
              _hasHydrated: true,
            });
            return;
          }

          const hydratedAuth = authResult.data;
          useAuthStore.setState({
            user: hydratedAuth.user,
            tokens: hydratedAuth.tokens as AuthTokens | null,
            isAuthenticated: hydratedAuth.isAuthenticated,
            intendedRoute: hydratedAuth.intendedRoute,
            isLoading: hydratedAuth.isLoading,
            error: hydratedAuth.error,
          });

          // Sync tokens to httpClient after rehydration
          if (hydratedAuth.tokens?.access_token) {
            httpClient.setAccessToken(hydratedAuth.tokens.access_token);
          } else {
            httpClient.setAccessToken(null);
          }

          // Restore active workspace context
          if (state.selectedTenantId) {
            httpClient.setTenantId(state.selectedTenantId);
          } else {
            httpClient.setTenantId(null);
          }

          // Set hydrated flag
          useAuthStore.setState({
            _hasHydrated: true,
          });
        }
      },
      partialize: (state) => ({
        user: sanitizeUser(state.user),
        selectedTenantId: state.selectedTenantId,
        memberships: state.memberships,
        tokens: redactTokens(state.tokens) as AuthTokens | null,
        isAuthenticated: state.isAuthenticated,
        dashboardVisibility: state.dashboardVisibility,
      }),
    },
  ),
);

// HTTP client token in sync
let syncedAccessToken = useAuthStore.getState().tokens?.access_token ?? null;
httpClient.setAccessToken(syncedAccessToken);
let syncedTenantId = useAuthStore.getState().selectedTenantId ?? null;
httpClient.setTenantId(syncedTenantId);

useAuthStore.subscribe((state) => {
  const nextToken = state.tokens?.access_token ?? null;
  if (nextToken !== syncedAccessToken) {
    syncedAccessToken = nextToken;
    httpClient.setAccessToken(nextToken);
  }

  const nextTenantId = state.selectedTenantId ?? null;
  if (nextTenantId !== syncedTenantId) {
    syncedTenantId = nextTenantId;
    httpClient.setTenantId(nextTenantId);
  }
});
