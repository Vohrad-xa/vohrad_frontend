import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import type {User, AuthTokens, AuthState} from '@vohrad/types';

const memory = new Map<string, string>();

// Default backend: in-memory (apps inject platform storage at runtime)
const storage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return memory.get(name) ?? null;
    } catch (error) {
      console.warn('Storage getItem failed:', error);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      memory.set(name, value);
    } catch (error) {
      console.warn('Storage setItem failed:', error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      memory.delete(name);
    } catch (error) {
      console.warn('Storage removeItem failed:', error);
    }
  },
};

// Allow runtime override of persist backend from the app
type AsyncKV = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

let persistBackend: AsyncKV = storage as AsyncKV;

export function setAuthPersistStorage(backend: AsyncKV) {
  if (
    backend &&
    typeof backend.getItem === 'function' &&
    typeof backend.setItem === 'function' &&
    typeof backend.removeItem === 'function'
  ) {
    persistBackend = backend;
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      intendedRoute: null,
      isLoading: false,
      error: null,
      setUser: (user: User) => set({user}),
      setTokens: (tokens: AuthTokens) => set({tokens}),
      setLoading: (loading: boolean) => set({isLoading: loading}),
      setError: (error: string | null) => set({error}),
      setIntendedRoute: (route: string | null) => set({intendedRoute: route}),
      clearError: () => set({error: null}),

      login: (user: User, tokens: AuthTokens) =>
        set({
          user,
          tokens,
          isAuthenticated: true,
          error: null,
        }),

      logout: () =>
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          intendedRoute: null,
          error: null,
        }),
    }),
    {
      name: 'vohrad-auth',
      // Use a wrapper so the backend can be swapped at runtime via setAuthPersistStorage
      storage: createJSONStorage(() => ({
        getItem: (key: string) => persistBackend.getItem(key),
        setItem: (key: string, value: string) => persistBackend.setItem(key, value),
        removeItem: (key: string) => persistBackend.removeItem(key),
      })),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
export type {User, AuthTokens, AuthState} from '@vohrad/types';
