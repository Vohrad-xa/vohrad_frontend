import {useEffect, useState} from 'react';
import {Alert, Platform} from 'react-native';
import {ActionSheetProvider} from '@expo/react-native-action-sheet';
import {setApiTenant} from '@vohrad/api-client';
import {authService} from '@vohrad/auth';
import {useAuthStore, setAuthPersistStorage} from '@vohrad/store';
import {Slot, useRootNavigationState, useRouter, useSegments, usePathname, type Href} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {LoadingOverlay} from '@/components/ui';
import {
  authenticateWithBiometrics,
  disableBiometrics,
  shouldRequireAuthenticationOnLaunch,
} from '@/modules/security/biometric-service';
import {AppThemeProvider, AuthProvider, useAuth} from '@/providers';
import {secureStorage} from '@/utils/secure-storage';
import * as AppStorage from '@/utils/storage';

// TODO: Remove when expo-router updates to new pointerEvents API
if (Platform.OS === 'web') {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('props.pointerEvents is deprecated')) {
      return;
    }
    originalWarn.apply(console, args);
  };
}

SplashScreen.preventAutoHideAsync().catch(() => {});

export const unstable_settings = {
  initialRouteName: '(auth)',
};

// Handles auth-aware routing and splash overlay transitions.
function RootNavigation() {
  const {isAuthenticated} = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const pathname = usePathname();
  const navigationState = useRootNavigationState();
  const rootSegment = segments[0];
  const {setIntendedRoute, intendedRoute} = useAuthStore();
  const [showOverlay, setShowOverlay] = useState(true);

  useEffect(() => {
    if (!navigationState?.key) {
      return;
    }

    const inAuthGroup = rootSegment === '(auth)';
    if (!isAuthenticated && !inAuthGroup) {
      if (pathname !== '/login') {
        setIntendedRoute(pathname);
      }
      router.replace('/login');
      return;
    }

    if (isAuthenticated && inAuthGroup) {
      const destination = intendedRoute ?? '/';
      setIntendedRoute(null);
      router.replace(destination as Href);
    }
  }, [isAuthenticated, navigationState?.key, router, rootSegment, pathname, setIntendedRoute, intendedRoute]);

  useEffect(() => {
    if (navigationState?.key) {
      const timer = setTimeout(() => {
        setShowOverlay(false);
        SplashScreen.hideAsync().catch(() => {});
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [navigationState?.key]);

  return (
    <>
      <Slot />
      {showOverlay && <LoadingOverlay />}
    </>
  );
}

// Bootstraps secure auth persistence and wires global providers.
export default function RootLayout() {
  useEffect(() => {
    let cancelled = false;

    const bootstrapAuthPersistence = async () => {
      try {
        const legacyKey = 'vohrad-auth';
        // Restore tenant affinity before any web requests fire.
        const savedTenantSubdomain = await AppStorage.getTenantSubdomain();
        if (savedTenantSubdomain) {
          setApiTenant(savedTenantSubdomain);
        }

        const legacyPayload = await AppStorage.getItem(legacyKey);

        if (legacyPayload) {
          await secureStorage.setItem(legacyKey, legacyPayload);
          await AppStorage.removeItem(legacyKey);
        }

        if (cancelled) return;

        const hydrationState = {locked: true};

        // Swap zustand persistence backend to secure storage with a hydration lock.
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

        // Peek at persisted snapshot to decide if biometric gate is needed.
        const storedSnapshotRaw = await secureStorage.getItem(legacyKey);
        let shouldHydrate = true;
        let persistedHasRefreshToken = false;

        if (storedSnapshotRaw) {
          try {
            const snapshot = JSON.parse(storedSnapshotRaw) as {
              state?: {tokens?: {refresh_token?: string}};
            };
            persistedHasRefreshToken = Boolean(snapshot?.state?.tokens?.refresh_token);
          } catch (error) {
            console.error('[app/_layout] Failed to parse persisted auth snapshot:', error);
          }
        }

        if (persistedHasRefreshToken) {
          // Require biometric auth before hydrating sensitive tokens.
          const requireBiometric = await shouldRequireAuthenticationOnLaunch();
          if (requireBiometric) {
            const authResult = await authenticateWithBiometrics('Unlock your account');
            if (!authResult.success) {
              await disableBiometrics();
              await secureStorage.removeItem(legacyKey);
              shouldHydrate = false;
              if (!authResult.cancelled) {
                Alert.alert('Authentication failed', 'Please sign in again to continue.');
              }
            }
          }
        }

        hydrationState.locked = false;

        if (!shouldHydrate) {
          // Biometric failed: reset auth store and skip hydrate.
          useAuthStore.setState({
            user: null,
            tokens: null,
            isAuthenticated: false,
            intendedRoute: null,
            error: null,
          });
          return;
        }

        await useAuthStore.persist?.rehydrate?.();

        if (cancelled) return;

        if (Platform.OS === 'web') {
          const {isAuthenticated} = useAuthStore.getState();
          if (!isAuthenticated) {
            try {
              // Attempt to rehydrate session using HttpOnly refresh cookie.
              await authService.restoreSessionFromCookie();
            } catch (error) {
              console.error('[app/_layout] Failed to restore web session from cookie:', error);
            }
          }
        }

        const {tokens, isAuthenticated} = useAuthStore.getState();

        if (isAuthenticated && tokens?.refresh_token && !tokens.access_token) {
          try {
            await authService.refreshToken();
          } catch (error) {
            console.error('[app/_layout] Failed to refresh access token on boot:', error);
          }
        }
      } catch (error) {
        console.error('[app/_layout] Failed to bootstrap secure auth persistence:', error);
      }
    };

    bootstrapAuthPersistence();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <ActionSheetProvider>
        <AppThemeProvider>
          <AuthProvider>
            <RootNavigation />
          </AuthProvider>
        </AppThemeProvider>
      </ActionSheetProvider>
    </GestureHandlerRootView>
  );
}
