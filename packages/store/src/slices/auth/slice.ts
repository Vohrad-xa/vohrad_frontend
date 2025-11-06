import type {StateCreator} from 'zustand';
import type {User, AuthTokens} from '@vohrad/types';
import {httpClient} from '@vohrad/api-client';

export interface AuthSlice {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  intendedRoute: string | null;
  isLoading: boolean;
  error: string | null;
  retryCallback: (() => void) | null;
  setUser: (user: User) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null, retryCallback?: () => void) => void;
  setIntendedRoute: (route: string | null) => void;
  updateUser: (userData: Partial<User>) => void;
  login: (user: User, tokens: AuthTokens) => void;
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

  setUser: (user: User) => set({user}),

  // CRITICAL: setTokens ALWAYS syncs to httpClient
  setTokens: (tokens: AuthTokens | null) => {
    httpClient.setAccessToken(tokens?.access_token || null);
    set({tokens});
  },

  setLoading: (loading: boolean) => set({isLoading: loading}),
  setError: (error: string | null, retryCallback?: () => void) =>
    set({error, retryCallback: retryCallback ?? null}),
  setIntendedRoute: (route: string | null) => set({intendedRoute: route}),
  clearError: () => set({error: null, retryCallback: null}),

  updateUser: (userData: Partial<User>) =>
    set((state) => ({
      user: state.user ? {...state.user, ...userData} : null,
    })),

  login: (user: User, tokens: AuthTokens) => {
    // Sync token to httpClient before updating state
    httpClient.setAccessToken(tokens.access_token);
    set({
      user,
      tokens,
      isAuthenticated: true,
      error: null,
    });
  },

  logout: () => {
    // Clear token from httpClient
    httpClient.setAccessToken(null);
    set({
      user: null,
      tokens: null,
      isAuthenticated: false,
      intendedRoute: null,
      error: null,
    });
  },
});
