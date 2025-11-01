import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import {createAuthSlice, type AuthSlice} from './slices/auth/slice';
import {createTenantSlice, type TenantSlice} from './slices/tenant/slice';
import {createSystemSlice, type SystemSlice} from './slices/system/slice';
import {createItemSlice, type ItemSlice} from './slices/item/slice';
import {
  createAttachmentSlice,
  type AttachmentSlice,
} from './slices/attachment/slice';
import {createFilterSlice, type FilterSlice} from './slices/filter/slice';
import {sanitizeUser, redactTokens} from './utils/sanitizers';
import {getPersistBackend} from './utils/storage';
import {httpClient} from '@vohrad/api-client';

export type StoreState = AuthSlice &
  TenantSlice &
  SystemSlice &
  ItemSlice &
  AttachmentSlice &
  FilterSlice & {
    _hasHydrated: boolean;
  };

export const useAuthStore = create<StoreState>()(
  persist(
    (set, get, store) => ({
      ...createAuthSlice(set, get, store),
      ...createTenantSlice(set, get, store),
      ...createSystemSlice(set, get, store),
      ...createItemSlice(set, get, store),
      ...createAttachmentSlice(set, get, store),
      ...createFilterSlice(set, get, store),
      _hasHydrated: false,
    }),
    {
      name: 'vohrad-auth',
      storage: createJSONStorage(() => ({
        getItem: (key: string) => getPersistBackend().getItem(key),
        setItem: (key: string, value: string) =>
          getPersistBackend().setItem(key, value),
        removeItem: (key: string) => getPersistBackend().removeItem(key),
      })),
      onRehydrateStorage: () => (state) => {
        // Sync tokens to httpClient after rehydration
        if (state?.tokens?.access_token) {
          httpClient.setAccessToken(state.tokens.access_token);
        }
        // Set hydrated flag
        useAuthStore.setState({
          _hasHydrated: true,
        });
      },
      partialize: (state) => ({
        user: sanitizeUser(state.user),
        tenant: state.tenant,
        tokens: redactTokens(state.tokens),
        isAuthenticated: state.isAuthenticated,
        imageUrls: state.imageUrls,
        dashboardVisibility: state.dashboardVisibility,
      }),
    },
  ),
);

// HTTP client token in sync
let syncedAccessToken = useAuthStore.getState().tokens?.access_token ?? null;
httpClient.setAccessToken(syncedAccessToken);

useAuthStore.subscribe((state) => {
  const nextToken = state.tokens?.access_token ?? null;
  if (nextToken !== syncedAccessToken) {
    syncedAccessToken = nextToken;
    httpClient.setAccessToken(nextToken);
  }
});
