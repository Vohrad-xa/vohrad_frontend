import type {
  AuthContextData,
  AuthStateData,
  AuthTokens,
  Identity,
  StartWebLoginOptions,
} from './schemas';

export interface AsyncState<TData = unknown, TError = string | null> {
  data: TData;
  isLoading: boolean;
  error: TError;
}

type AuthStateActions = {
  setUser: (user: Identity) => void;
  setTokens: (tokens: AuthTokens) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setIntendedRoute: (route: string | null) => void;
  updateUser: (userData: Partial<Identity>) => void;
  login: (user: Identity, tokens: AuthTokens) => void;
  logout: () => void;
  clearError: () => void;
};
type AuthContextActions = {
  startWebLogin: (
    returnTo?: string,
    options?: StartWebLoginOptions,
  ) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
};

export type AuthState = AuthStateData & AuthStateActions;
export type AuthContextValue = AuthContextData & AuthContextActions;
export type {
  MobileOidcLoginParams,
  OidcStartAction,
  StartWebLoginOptions,
} from './schemas';
