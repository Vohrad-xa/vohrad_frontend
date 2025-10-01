import {useEffect, useState} from 'react';
import {Platform} from 'react-native';
import {ActionSheetProvider} from '@expo/react-native-action-sheet';
import {authService} from '@vohrad/auth';
import {useAuthStore, setAuthPersistStorage} from '@vohrad/store';
import {Slot, useRootNavigationState, useRouter, useSegments, usePathname, type Href} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {LoadingOverlay} from '@/components/ui';
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

export default function RootLayout() {
  useEffect(() => {
    let cancelled = false;

    const bootstrapAuthPersistence = async () => {
      try {
        const legacyKey = 'vohrad-auth';
        const legacyPayload = await AppStorage.getItem(legacyKey);

        if (legacyPayload) {
          await secureStorage.setItem(legacyKey, legacyPayload);
          await AppStorage.removeItem(legacyKey);
        }

        if (cancelled) return;

        const hydrationState = {locked: true};

        setAuthPersistStorage({
          getItem: (key) => secureStorage.getItem(key),
          setItem: async (key, value) => {
            if (hydrationState.locked) {
              return;
            }
            await secureStorage.setItem(key, value);
          },
          removeItem: async (key) => {
            if (hydrationState.locked) {
              return;
            }
            await secureStorage.removeItem(key);
          },
        });

        await useAuthStore.persist?.rehydrate?.();

        if (cancelled) return;

        hydrationState.locked = false;

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
