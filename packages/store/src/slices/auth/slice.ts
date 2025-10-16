import type {StateCreator} from 'zustand';
import type {User, AuthTokens} from '@vohrad/types';

export interface AuthSlice {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  intendedRoute: string | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User) => void;
  setTokens: (tokens: AuthTokens) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
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

  setUser: (user: User) => set({user}),
  setTokens: (tokens: AuthTokens) => set({tokens}),
  setLoading: (loading: boolean) => set({isLoading: loading}),
  setError: (error: string | null) => set({error}),
  setIntendedRoute: (route: string | null) => set({intendedRoute: route}),
  clearError: () => set({error: null}),

  updateUser: (userData: Partial<User>) =>
    set((state) => ({
      user: state.user ? {...state.user, ...userData} : null,
    })),

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
});
