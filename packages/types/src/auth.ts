import type {Tenant} from './tenant';
import type {User, AuthTokens} from './schemas';

export interface AsyncState<TData = unknown, TError = string | null> {
  data: TData;
  isLoading: boolean;
  error: TError;
}

export interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  intendedRoute: string | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User) => void;
  setTenant: (tenant: Tenant | null) => void;
  setTokens: (tokens: AuthTokens) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setIntendedRoute: (route: string | null) => void;
  updateUser: (userData: Partial<User>) => void;
  updateTenant: (tenantData: Partial<Tenant>) => void;
  login: (user: User, tokens: AuthTokens) => void;
  logout: () => void;
  clearError: () => void;
}

export type MobileOidcLoginParams = {
  subdomain: string;
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
  user: User | null;
  isLoading: boolean;
  error: string | null;
  authReady: boolean;
  startWebLogin: (subdomain: string, returnTo?: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}
