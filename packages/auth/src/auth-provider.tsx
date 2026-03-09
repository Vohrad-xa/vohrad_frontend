import React, {useCallback, useEffect, useMemo} from 'react';
import {useAuthStore} from '@sykamore/store';
import type {AuthContextValue, StartWebLoginOptions} from '@sykamore/types';
import {authService} from './auth-service';
import {AuthContext} from './context/auth-context';

export function AuthProvider({children}: {children: React.ReactNode}) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);
  const authReady = useAuthStore((state) => state._hasHydrated);

  useEffect(() => {
    authService.startRuntime();
    return () => {
      authService.stopRuntime();
    };
  }, []);

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
      authReady,
      startWebLogin,
      logout,
      clearError,
    }),
    [
      authReady,
      clearError,
      error,
      isAuthenticated,
      isLoading,
      logout,
      startWebLogin,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
