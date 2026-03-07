import {Alert, Platform} from 'react-native';
import {initApiConfig} from '@sykamore/api-client';
import {authService, initMobileOidcConfig} from '@sykamore/auth';
import {
  useAuthStore,
  setAuthPersistStorage,
  AUTH_PERSIST_KEY,
} from '@sykamore/store';
import {validation} from '@sykamore/types';
import {
  authenticateWithBiometrics,
  disableBiometrics,
  shouldRequireAuthenticationOnLaunch,
} from '@/features/security/biometric-service';
import {env} from './env';
import {secureStorage} from './secure-storage';

initApiConfig({
  baseUrl: env.api.baseUrl,
  protocol: env.api.protocol,
  baseDomain: env.api.baseDomain,
  version: env.api.version,
});

if (env.oidc.issuerUrl && env.oidc.mobileClientId) {
  initMobileOidcConfig({
    issuerUrl: env.oidc.issuerUrl,
    mobileClientId: env.oidc.mobileClientId,
    scopes: env.oidc.scopes,
    mobileRedirectUri: env.oidc.redirectUri,
  });
}

/**
 * Wires secureStorage as the Zustand persist adapter and returns a write-lock handle.
 *
 * - Writes are blocked while locked to prevent flushing stale state during hydration.
 */
function configureZustandPersistence() {
  const hydrationState = {locked: true};

  setAuthPersistStorage({
    getItem: (key: string) => secureStorage.getItem(key),
    setItem: async (key: string, value: string) => {
      if (hydrationState.locked) return;
      await secureStorage.setItem(key, value);
    },
    removeItem: async (key: string) => {
      if (hydrationState.locked) return;
      await secureStorage.removeItem(key);
    },
  });

  return hydrationState;
}

/**
 * Returns true if a refresh token exists in the persisted auth snapshot.
 */
async function hasPersistedRefreshToken(): Promise<boolean> {
  const raw = await secureStorage.getItem(AUTH_PERSIST_KEY);
  if (!raw) return false;

  try {
    const parsedResult = validation.parseJson(raw);
    if (!parsedResult.success) {
      return false;
    }

    const snapshotResult = validation.validateAuthPersistSnapshot(
      parsedResult.data,
    );
    if (!snapshotResult.success) {
      return false;
    }

    return Boolean(snapshotResult.data.state?.tokens?.refresh_token);
  } catch (error) {
    console.error('[bootstrap] Failed to parse auth snapshot:', error);
    return false;
  }
}

/**
 * Prompts biometric unlock when required; clears the session on failure.
 *
 * - Returns false if authentication fails or is cancelled, true in all other cases.
 */
async function handleBiometricAuthentication(): Promise<boolean> {
  if (!(await hasPersistedRefreshToken())) return true;
  if (!(await shouldRequireAuthenticationOnLaunch())) return true;

  const result = await authenticateWithBiometrics('Unlock your account');
  if (result.success) return true;

  await disableBiometrics();
  await secureStorage.removeItem(AUTH_PERSIST_KEY);

  if (!result.cancelled) {
    Alert.alert('Authentication failed', 'Please sign in again to continue.');
  }

  return false;
}

/**
 * Rehydrates the Zustand auth store and refreshes the access token if absent.
 *
 * - On web, restores the session from the OIDC cookie instead.
 */
async function rehydrateSession(): Promise<void> {
  await useAuthStore.persist?.rehydrate?.();

  if (Platform.OS === 'web') {
    const restored = await authService.restoreSessionFromCookie();
    if (!restored) useAuthStore.getState().logout();
    return;
  }

  const {tokens, isAuthenticated} = useAuthStore.getState();
  if (isAuthenticated && tokens?.refresh_token && !tokens.access_token) {
    try {
      await authService.refreshToken();
    } catch (error) {
      console.error('[bootstrap] Token refresh on boot failed:', error);
    }
  }
}

/**
 * Resets the auth store to a fully logged-out state.
 */
function clearAuthState(): void {
  useAuthStore.setState({
    user: null,
    tokens: null,
    isAuthenticated: false,
    intendedRoute: null,
    error: null,
  });
}

/**
 * Configures persistence, gates on biometrics, and rehydrates the auth session.
 *
 * - Must be awaited before rendering protected routes.
 * - Never throws — errors are logged internally.
 */
export async function bootstrap(): Promise<void> {
  try {
    const hydrationState = configureZustandPersistence();

    const ok = await handleBiometricAuthentication();
    hydrationState.locked = false;

    if (!ok) {
      clearAuthState();
      return;
    }

    await rehydrateSession();
  } catch (error) {
    console.error('[bootstrap] Unexpected failure:', error);
  }
}
