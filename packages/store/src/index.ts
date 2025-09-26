import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import type {User, AuthTokens, AuthState} from '@vohrad/types';

const storage = {
  getItem: (name: string): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(name);
    }
    return null;
  },
  setItem: (name: string, value: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(name, value);
    }
  },
  removeItem: (name: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(name);
    }
  },
};

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
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
export type {User, AuthTokens, AuthState} from '@vohrad/types';
