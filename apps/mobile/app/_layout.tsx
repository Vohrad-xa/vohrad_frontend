import {useEffect, useState} from 'react';
import {Platform, LogBox} from 'react-native';
import {ActionSheetProvider} from '@expo/react-native-action-sheet';
import {useAuthStore, setAuthPersistStorage} from '@vohrad/store';
import {Slot, useRootNavigationState, useRouter, useSegments, usePathname} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {AppThemeProvider, AuthProvider, useAuth} from '@/providers';
import {LoadingOverlay} from '@/components/ui';
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
      setIntendedRoute(null);
      router.replace('/');
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
  // Ensure persisted auth uses app storage (AsyncStorage on native, localStorage on web)
  useEffect(() => {
    setAuthPersistStorage({
      getItem: (k) => AppStorage.getItem(k),
      setItem: (k, v) => AppStorage.setItem(k, v),
      removeItem: (k) => AppStorage.removeItem(k),
    });
    useAuthStore.persist?.rehydrate?.();
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
