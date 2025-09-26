import {useEffect} from 'react';
import {ActionSheetProvider} from '@expo/react-native-action-sheet';
import {useAuthStore} from '@vohrad/store';
import {Slot, useRootNavigationState, useRouter, useSegments, usePathname} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {AppThemeProvider, AuthProvider, useAuth} from '@/providers';

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

  return <Slot />;
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
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
