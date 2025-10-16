import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import {createAuthSlice, type AuthSlice} from './slices/auth';
import {createTenantSlice, type TenantSlice} from './slices/tenant';
import {sanitizeUser, redactTokens} from './utils/sanitizers';
import {setAuthPersistStorage, getPersistBackend} from './utils/storage';

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

export {setAuthPersistStorage};
export {authSelectors} from './slices/auth';
export {tenantSelectors} from './slices/tenant';
export type {User, AuthTokens, Tenant} from '@vohrad/types';
export type {AuthSlice} from './slices/auth';
export type {TenantSlice} from './slices/tenant';
