import type {AuthSlice} from './slice';

// Selectors provide typed, optimized state access
export const authSelectors = {
  user: (state: AuthSlice) => state.user,
  tokens: (state: AuthSlice) => state.tokens,
  isAuthenticated: (state: AuthSlice) => state.isAuthenticated,
  isLoading: (state: AuthSlice) => state.isLoading,
  error: (state: AuthSlice) => state.error,
  intendedRoute: (state: AuthSlice) => state.intendedRoute,
  updateUser: (state: AuthSlice) => state.updateUser,
  setError: (state: AuthSlice) => state.setError,
  clearError: (state: AuthSlice) => state.clearError,
};
