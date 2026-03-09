import type {StateCreator} from 'zustand';
import type {Identity, AuthTokens} from '@sykamore/types';

export interface AuthSlice {
  user: Identity | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  intendedRoute: string | null;
  isLoading: boolean;
  error: string | null;
  retryCallback: (() => void) | null;
  setUser: (user: Identity) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null, retryCallback?: () => void) => void;
  setIntendedRoute: (route: string | null) => void;
  updateUser: (userData: Partial<Identity>) => void;
  login: (user: Identity, tokens: AuthTokens) => void;
  logout: () => void;
  clearError: () => void;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  user: null,
  tokens: null,
  isAuthenticated: false,
  intendedRoute: null,
  isLoading: false,
  error: null,
  retryCallback: null,

  setUser: (user: Identity) => set({user}),
  setTokens: (tokens: AuthTokens | null) => set({tokens}),
  setLoading: (loading: boolean) => set({isLoading: loading}),
  setError: (error: string | null, retryCallback?: () => void) =>
    set({error, retryCallback: retryCallback ?? null}),
  setIntendedRoute: (route: string | null) => set({intendedRoute: route}),
  clearError: () => set({error: null, retryCallback: null}),

  updateUser: (userData: Partial<Identity>) =>
    set((state) => ({
      user: state.user ? {...state.user, ...userData} : null,
    })),

  login: (user: Identity, tokens: AuthTokens) => {
    set({
      user,
      tokens,
      isAuthenticated: true,
      error: null,
      retryCallback: null,
    });
  },

  logout: () => {
    set({
      user: null,
      tokens: null,
      isAuthenticated: false,
      intendedRoute: null,
      error: null,
      retryCallback: null,
    });
  },
});
