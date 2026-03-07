import React, {createContext, useCallback, useContext, useMemo} from 'react';
import {authService} from './auth-service';
import {useAuthStore} from '@sykamore/store';
import type {AuthContextValue, StartWebLoginOptions} from '@sykamore/types';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({children}: {children: React.ReactNode}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);

  const startWebLogin = useCallback(
    async (returnTo?: string, options?: StartWebLoginOptions) => {
      await authService.startWebLogin(returnTo, options);
    },
    [],
  );

  const logout = useCallback(async () => {
    await authService.logout();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      user,
      isLoading,
      error,
      authReady: _hasHydrated,
      startWebLogin,
      logout,
      clearError,
    }),
    [
      isAuthenticated,
      user,
      isLoading,
      error,
      _hasHydrated,
      startWebLogin,
      logout,
      clearError,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
