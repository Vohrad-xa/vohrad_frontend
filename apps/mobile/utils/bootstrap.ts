import {Alert, Platform} from 'react-native';
import {setApiTenant} from '@sykamore/api-client';
import {authService} from '@sykamore/auth';
import {useAuthStore, setAuthPersistStorage} from '@sykamore/store';
import {
  authenticateWithBiometrics,
  disableBiometrics,
  shouldRequireAuthenticationOnLaunch,
} from '@/modules/security/biometric-service';
import {secureStorage} from '@/utils/secure-storage';
import * as AppStorage from '@/utils/storage';

async function migrateLegacyStorage() {
  const legacyKey = 'vohrad-auth';
  const savedTenantSubdomain = await AppStorage.getTenantSubdomain();
  if (savedTenantSubdomain) {
    setApiTenant(savedTenantSubdomain);
  }

  const legacyPayload = await AppStorage.getItem(legacyKey);
  if (legacyPayload) {
    await secureStorage.setItem(legacyKey, legacyPayload);
    await AppStorage.removeItem(legacyKey);
  }
}

function configureZustandPersistence() {
  const hydrationState = {locked: true};

  setAuthPersistStorage({
    getItem: (key: string) => secureStorage.getItem(key),
    setItem: async (key: string, value: string) => {
      if (hydrationState.locked) {
        return;
      }
      await secureStorage.setItem(key, value);
    },
    removeItem: async (key: string) => {
      if (hydrationState.locked) {
        return;
      }
      await secureStorage.removeItem(key);
    },
  });

  return hydrationState;
}

async function handleBiometricAuthentication(): Promise<boolean> {
  const legacyKey = 'vohrad-auth';
  const storedSnapshotRaw = await secureStorage.getItem(legacyKey);
  let persistedHasRefreshToken = false;

  if (storedSnapshotRaw) {
    try {
      const snapshot = JSON.parse(storedSnapshotRaw) as {
        state?: {tokens?: {refresh_token?: string}};
      };
      persistedHasRefreshToken = Boolean(
        snapshot?.state?.tokens?.refresh_token,
      );
    } catch (error) {
      console.error(
        '[bootstrap] Failed to parse persisted auth snapshot:',
        error,
      );
    }
  }

  if (persistedHasRefreshToken) {
    const requireBiometric = await shouldRequireAuthenticationOnLaunch();
    if (requireBiometric) {
      const authResult = await authenticateWithBiometrics(
        'Unlock your account',
      );
      if (!authResult.success) {
        await disableBiometrics();
        await secureStorage.removeItem(legacyKey);
        if (!authResult.cancelled) {
          Alert.alert(
            'Authentication failed',
            'Please sign in again to continue.',
          );
        }
        return false;
      }
    }
  }

  return true;
}

async function rehydrateSession() {
  await useAuthStore.persist?.rehydrate?.();

  if (Platform.OS === 'web') {
    const {isAuthenticated} = useAuthStore.getState();
    if (!isAuthenticated) {
      try {
        await authService.restoreSessionFromCookie();
      } catch (error) {
        console.error(
          '[bootstrap] Failed to restore web session from cookie:',
          error,
        );
      }
    }
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

export async function bootstrap(): Promise<void> {
  try {
    await migrateLegacyStorage();
    const hydrationState = configureZustandPersistence();
    const shouldHydrate = await handleBiometricAuthentication();

    hydrationState.locked = false;

    if (!shouldHydrate) {
      useAuthStore.setState({
        user: null,
        tokens: null,
        isAuthenticated: false,
        intendedRoute: null,
        error: null,
      });
      return;
    }

    await rehydrateSession();
  } catch (error) {
    console.error('[bootstrap] Failed to bootstrap app:', error);
  }
}
