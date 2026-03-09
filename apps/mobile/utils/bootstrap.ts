import {Alert, Platform} from 'react-native';
import {initApiConfig} from '@sykamore/api-client';
import {authService, initMobileOidcConfig} from '@sykamore/auth';
import {
  useAuthStore,
  setAuthPersistStorage,
  AUTH_PERSIST_KEY,
} from '@sykamore/store';
import {parseJson, validateAuthPersistSnapshot} from '@sykamore/types';
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

async function hasPersistedRefreshToken(): Promise<boolean> {
  const raw = await secureStorage.getItem(AUTH_PERSIST_KEY);
  if (!raw) return false;

  try {
    const parsedResult = parseJson(raw);
    if (!parsedResult.success) {
      return false;
    }

    const snapshotResult = validateAuthPersistSnapshot(parsedResult.data);
    if (!snapshotResult.success) {
      return false;
    }

    return Boolean(snapshotResult.data.state?.tokens?.refresh_token);
  } catch (error) {
    console.error('[bootstrap] Failed to parse persisted auth snapshot:', error);
    return false;
  }
}

async function handleBiometricAuthentication(): Promise<boolean> {
  if (!(await hasPersistedRefreshToken())) return true;
  if (!(await shouldRequireAuthenticationOnLaunch())) return true;

  const result = await authenticateWithBiometrics('Unlock your account');
  if (result.success) return true;

  await disableBiometrics();
  await secureStorage.removeItem(AUTH_PERSIST_KEY);

  if (!result.cancelled) {
    Alert.alert('Unlock Failed', 'Please sign in again to continue.');
  }

  return false;
}

async function rehydrateSession(): Promise<void> {
  await useAuthStore.persist?.rehydrate?.();

  if (Platform.OS === 'web') {
    const restored = await authService.restoreBrowserSession();
    if (!restored) authService.resetSession();
    return;
  }

  const {tokens, isAuthenticated} = useAuthStore.getState();
  if (isAuthenticated && tokens?.refresh_token && !tokens.access_token) {
    try {
      await authService.refreshToken();
    } catch (error) {
      console.error('[bootstrap] Session refresh on app launch failed:', error);
    }
  }
}

function clearAuthState(): void {
  authService.resetSession();
}

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
    console.error('[bootstrap] Auth bootstrap failed unexpectedly:', error);
  }
}
