import {Alert, Platform} from 'react-native';
import {authService} from '@sykamore/auth';
import {useAuthStore, setAuthPersistStorage, AUTH_PERSIST_KEY} from '@sykamore/store';
import {
  authenticateWithBiometrics,
  disableBiometrics,
  shouldRequireAuthenticationOnLaunch,
} from '@/features/security/biometric-service';
import {secureStorage} from './secure-storage';

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
    const snapshot = JSON.parse(raw) as {
      state?: {tokens?: {refresh_token?: string}};
    };
    return Boolean(snapshot?.state?.tokens?.refresh_token);
  } catch (error) {
    console.error(
      '[bootstrap] Failed to parse persisted auth snapshot:',
      error,
    );
    return false;
  }
}

async function handleBiometricAuthentication(): Promise<boolean> {
  const persistedHasRefreshToken = await hasPersistedRefreshToken();
  if (!persistedHasRefreshToken) return true;

  const requireBiometric = await shouldRequireAuthenticationOnLaunch();
  if (!requireBiometric) return true;

  const authResult = await authenticateWithBiometrics('Unlock your account');
  if (authResult.success) return true;

  // If auth fails/cancelled: disable biometrics and wipe persisted auth snapshot.
  await disableBiometrics();
  await secureStorage.removeItem(AUTH_PERSIST_KEY);

  if (!authResult.cancelled) {
    Alert.alert('Authentication failed', 'Please sign in again to continue.');
  }

  return false;
}

async function rehydrateSession() {
  await useAuthStore.persist?.rehydrate?.();

  if (Platform.OS === 'web') {
    const restored = await authService.restoreSessionFromCookie();
    if (!restored) {
      useAuthStore.getState().logout();
    }
    return;
  }

  const {tokens, isAuthenticated} = useAuthStore.getState();
  if (isAuthenticated && tokens?.refresh_token && !tokens.access_token) {
    try {
      await authService.refreshToken();
    } catch (error) {
      console.error(
        '[bootstrap] Failed to refresh access token on boot:',
        error,
      );
    }
  }
}

function clearAuthState() {
  useAuthStore.setState({
    user: null,
    tokens: null,
    isAuthenticated: false,
    intendedRoute: null,
    error: null,
  });
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
    console.error('[bootstrap] Failed to bootstrap app:', error);
  }
}
