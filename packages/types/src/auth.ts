import type {Identity, AuthTokens} from './schemas';

export interface AsyncState<TData = unknown, TError = string | null> {
  data: TData;
  isLoading: boolean;
  error: TError;
}

export interface AuthState {
  user: Identity | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  intendedRoute: string | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: Identity) => void;
  setTokens: (tokens: AuthTokens) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setIntendedRoute: (route: string | null) => void;
  updateUser: (userData: Partial<Identity>) => void;
  login: (user: Identity, tokens: AuthTokens) => void;
  logout: () => void;
  clearError: () => void;
}

export type MobileOidcLoginParams = {
  code: string;
  codeVerifier: string;
  redirectUri: string;
  /**
   * Pre-fetched token endpoint from OIDC discovery
   * avoids a second discovery request in the service.
   */
  tokenEndpoint?: string;
};

export interface AuthContextValue {
  isAuthenticated: boolean;
  user: Identity | null;
  isLoading: boolean;
  error: string | null;
  authReady: boolean;
  startWebLogin: (
    returnTo?: string,
    options?: {setupPasskey?: boolean},
  ) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}
