import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import {createAuthSlice, type AuthSlice} from './slices/auth/slice';
import {createTenantSlice, type TenantSlice} from './slices/tenant/slice';
import {sanitizeUser, redactTokens} from './utils/sanitizers';
import {getPersistBackend} from './utils/storage';

export type StoreState = AuthSlice & TenantSlice;

export const useAuthStore = create<StoreState>()(
  persist(
    (...args) => ({
      ...createAuthSlice(...args),
      ...createTenantSlice(...args),
    }),
    {
      name: 'vohrad-auth',
      storage: createJSONStorage(() => ({
        getItem: (key: string) => getPersistBackend().getItem(key),
        setItem: (key: string, value: string) =>
          getPersistBackend().setItem(key, value),
        removeItem: (key: string) => getPersistBackend().removeItem(key),
      })),
      partialize: (state) => ({
        user: sanitizeUser(state.user),
        tenant: state.tenant,
        tokens: redactTokens(state.tokens),
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
