import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import type {User, AuthTokens, AuthState} from '@vohrad/types';

// Platform-specific storage detection
let AsyncStorage: any = null;
let isReactNative = false;

try {
  if (typeof navigator !== 'undefined' && (navigator as any).product === 'ReactNative') {
    AsyncStorage = require('@react-native-async-storage/async-storage').default;
    isReactNative = true;
  }
} catch (_e) {
  AsyncStorage = null;
  isReactNative = false;
}

// Cross-platform storage adapter
const storage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      if (isReactNative && AsyncStorage) {
        return await AsyncStorage.getItem(name);
      } else if (
        typeof globalThis !== 'undefined' &&
        typeof (globalThis as any).localStorage !== 'undefined'
      ) {
        return (globalThis as any).localStorage.getItem(name);
      }
      return null;
    } catch (error) {
      console.warn('Storage getItem failed:', error);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      if (isReactNative && AsyncStorage) {
        await AsyncStorage.setItem(name, value);
      } else if (
        typeof globalThis !== 'undefined' &&
        typeof (globalThis as any).localStorage !== 'undefined'
      ) {
        (globalThis as any).localStorage.setItem(name, value);
      }
    } catch (error) {
      console.warn('Storage setItem failed:', error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      if (isReactNative && AsyncStorage) {
        await AsyncStorage.removeItem(name);
      } else if (
        typeof globalThis !== 'undefined' &&
        typeof (globalThis as any).localStorage !== 'undefined'
      ) {
        (globalThis as any).localStorage.removeItem(name);
      }
    } catch (error) {
      console.warn('Storage removeItem failed:', error);
    }
  },
};

// Debug storage selection on startup (dev only)
if (typeof __DEV__ !== 'undefined' ? __DEV__ : true) {
  const storageType = isReactNative && AsyncStorage ? 'AsyncStorage' : (typeof (globalThis as any).localStorage !== 'undefined' ? 'localStorage' : 'memory');
  // eslint-disable-next-line no-console
  console.log(`[auth-persist] using ${storageType}`);
  if (isReactNative && AsyncStorage) {
    (async () => {
      try {
        const k = 'vohrad:debug-storage';
        await AsyncStorage.setItem(k, 'ok');
        const v = await AsyncStorage.getItem(k);
        await AsyncStorage.removeItem(k);
        // eslint-disable-next-line no-console
        console.log(`[auth-persist] AsyncStorage round-trip: ${v === 'ok' ? 'success' : 'failed'}`);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('[auth-persist] AsyncStorage test failed:', e);
      }
    })();
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
