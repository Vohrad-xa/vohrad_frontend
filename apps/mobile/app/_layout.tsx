import {useEffect, useRef, useState} from 'react';
import {Alert, Platform} from 'react-native';
import {ActionSheetProvider} from '@expo/react-native-action-sheet';
import {setApiTenant} from '@vohrad/api-client';
import {authService} from '@vohrad/auth';
import {useAuthStore, setAuthPersistStorage} from '@vohrad/store';
import {
  Stack,
  useRootNavigationState,
  useRouter,
  usePathname,
  type Href,
} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {LoadingOverlay} from '@/components/ui';
import {
  authenticateWithBiometrics,
  disableBiometrics,
  shouldRequireAuthenticationOnLaunch,
} from '@/modules/security/biometric-service';
import {
  AppThemeProvider,
  AuthProvider,
  useAuth,
  LoadingProvider,
} from '@/providers';
import {secureStorage} from '@/utils/secure-storage';
import * as AppStorage from '@/utils/storage';

// TODO: Remove when expo-router updates to new pointerEvents API
if (Platform.OS === 'web') {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('props.pointerEvents is deprecated')
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };
}

type SplashControlState = {
  attempted: boolean;
  prevented: boolean;
  hidden: boolean;
  preventPromise?: Promise<boolean>;
};

const splashControlGlobal = globalThis as typeof globalThis & {
  __vohradSplashControl?: SplashControlState;
};

if (!splashControlGlobal.__vohradSplashControl) {
  splashControlGlobal.__vohradSplashControl = {
    attempted: false,
    prevented: false,
    hidden: false,
  };
}

const splashControl = splashControlGlobal.__vohradSplashControl;

if (!splashControl.attempted) {
  splashControl.attempted = true;
  splashControl.preventPromise = SplashScreen.preventAutoHideAsync()
    .then((result) => {
      splashControl.prevented = result;
      return result;
    })
    .catch((error) => {
      console.warn(
        '[app/_layout] Unable to prevent splash screen auto-hide:',
        error,
      );
      splashControl.prevented = false;
      splashControl.hidden = true;
      return false;
    });
}

export const unstable_settings = {
  initialRouteName: '(auth)',
};

// Handles auth-aware routing and splash overlay transitions.
function RootNavigation() {
  const {isAuthenticated} = useAuth();
  const navigationState = useRootNavigationState();
  const router = useRouter();
  const {setIntendedRoute, intendedRoute} = useAuthStore();
  const [showOverlay, setShowOverlay] = useState(true);
  const hasHiddenSplash = useRef(false);
  const pathname = usePathname();
  const isEmailConfirmRoute = pathname === '/email/confirm';

  // Save intended route when trying to access protected routes while not authenticated
  useEffect(() => {
    if (!navigationState?.key) {
      return;
    }

    if (
      !isAuthenticated &&
      pathname !== '/login' &&
      !pathname.startsWith('/(auth)') &&
      !isEmailConfirmRoute
    ) {
      setIntendedRoute(pathname);
    }
  }, [
    isAuthenticated,
    pathname,
    navigationState?.key,
    setIntendedRoute,
    isEmailConfirmRoute,
  ]);

  // Navigate to intended route after authentication
  useEffect(() => {
    if (
      navigationState?.key &&
      isAuthenticated &&
      intendedRoute &&
      intendedRoute !== '/email/confirm'
    ) {
      const destination = intendedRoute;
      setIntendedRoute(null);
      // Small delay to ensure navigation is ready
      setTimeout(() => {
        router.replace(destination as Href);
      }, 100);
    }
  }, [
    isAuthenticated,
    intendedRoute,
    navigationState?.key,
    setIntendedRoute,
    router,
  ]);

  useEffect(() => {
    if (intendedRoute === '/email/confirm') {
      setIntendedRoute(null);
    }
  }, [intendedRoute, setIntendedRoute]);

  useEffect(() => {
    if (!navigationState?.key || hasHiddenSplash.current) {
      return;
    }

    const timer = setTimeout(() => {
      setShowOverlay(false);

      const hideSplash = () => {
        if (hasHiddenSplash.current) {
          return;
        }

        hasHiddenSplash.current = true;

        if (!splashControl.hidden) {
          splashControl.hidden = true;

          if (splashControl.prevented) {
            SplashScreen.hideAsync().catch((error) => {
              console.warn(
                '[app/_layout] Failed to hide splash screen gracefully:',
                error,
              );
            });
          }
        }
      };

      if (splashControl.preventPromise) {
        splashControl.preventPromise.finally(hideSplash);
      } else {
        hideSplash();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [navigationState?.key]);

  const initialRouteName = isEmailConfirmRoute
    ? 'email/confirm'
    : isAuthenticated
      ? '(app)'
      : '(auth)';

  return (
    <>
      <Stack
        initialRouteName={initialRouteName}
        screenOptions={{headerShown: false}}
      >
        <Stack.Screen name="email/confirm" />
        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(app)" />
          <Stack.Screen
            name="(modals)"
            options={{
              presentation: 'modal',
            }}
          />
        </Stack.Protected>

        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
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
            persistedHasRefreshToken = Boolean(
              snapshot?.state?.tokens?.refresh_token,
            );
          } catch (error) {
            console.error(
              '[app/_layout] Failed to parse persisted auth snapshot:',
              error,
            );
          }
        }

        if (persistedHasRefreshToken) {
          // Require biometric auth before hydrating sensitive tokens.
          const requireBiometric = await shouldRequireAuthenticationOnLaunch();
          if (requireBiometric) {
            const authResult = await authenticateWithBiometrics(
              'Unlock your account',
            );
            if (!authResult.success) {
              await disableBiometrics();
              await secureStorage.removeItem(legacyKey);
              shouldHydrate = false;
              if (!authResult.cancelled) {
                Alert.alert(
                  'Authentication failed',
                  'Please sign in again to continue.',
                );
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
              console.error(
                '[app/_layout] Failed to restore web session from cookie:',
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
              '[app/_layout] Failed to refresh access token on boot:',
              error,
            );
          }
        }
      } catch (error) {
        console.error(
          '[app/_layout] Failed to bootstrap secure auth persistence:',
          error,
        );
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
          <LoadingProvider>
            <AuthProvider>
              <RootNavigation />
            </AuthProvider>
          </LoadingProvider>
        </AppThemeProvider>
      </ActionSheetProvider>
    </GestureHandlerRootView>
  );
}
