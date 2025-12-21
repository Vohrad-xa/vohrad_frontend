import React, {createContext, useContext} from 'react';
import {authService} from './auth-service';
import {useAuthStore} from '@sykamore/store';
import type {AuthContextValue} from '@sykamore/types';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({children}: {children: React.ReactNode}) {
  const {isAuthenticated, user, isLoading, error, clearError} = useAuthStore();

  // Auto-refresh is now handled automatically by AuthService

  const loginUser = async (
    email: string,
    password: string,
    subdomain: string,
  ) => {
    await authService.loginUser(email, password, subdomain);
  };

  const loginAdmin = async (email: string, password: string) => {
    await authService.loginAdmin(email, password);
  };

  const logout = async () => {
    await authService.logout();
  };

  const value: AuthContextValue = {
    isAuthenticated,
    user,
    isLoading,
    error,
    loginUser,
    loginAdmin,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
