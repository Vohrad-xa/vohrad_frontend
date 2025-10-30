import {useEffect, useState, useRef} from 'react';
import {Platform} from 'react-native';
import {ActionSheetProvider} from '@expo/react-native-action-sheet';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {Stack, usePathname, useRootNavigationState} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {StatusBar} from 'expo-status-bar';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {LoadingOverlay} from '@/components/ui';
import {FilterProvider} from '@/features/home/overview/filter-context';
import {
  AppThemeProvider,
  AuthProvider,
  useAuth,
  LoadingProvider,
  HapticProvider,
  useTheme,
} from '@/providers';
import {bootstrap} from '@/utils/bootstrap';

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

splashControlGlobal.__vohradSplashControl ??= {
  attempted: false,
  prevented: false,
  hidden: false,
};

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

function RootNavigation({isBootstrapComplete}: {isBootstrapComplete: boolean}) {
  const {isAuthenticated} = useAuth();
  const pathname = usePathname();
  const isEmailConfirmRoute = pathname === '/email/confirm';
  const navigationState = useRootNavigationState();
  const hasHiddenSplash = useRef(false);

  useEffect(() => {
    if (
      !navigationState?.key ||
      !isBootstrapComplete ||
      hasHiddenSplash.current
    ) {
      return;
    }

    hasHiddenSplash.current = true;

    if (!splashControl.hidden) {
      splashControl.hidden = true;

      if (splashControl.prevented) {
        SplashScreen.hideAsync().catch((error) => {
          console.warn('[app/_layout] Failed to hide splash screen:', error);
        });
      }
    }
  }, [navigationState?.key, isBootstrapComplete]);

  if (!isBootstrapComplete) {
    return <LoadingOverlay fullScreen />;
  }

  const initialRouteName = isEmailConfirmRoute
    ? 'email/confirm'
    : isAuthenticated
      ? '(app)'
      : '(auth)';

  return (
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
  );
}

function GlobalStatusBar() {
  const {scheme} = useTheme();

  return (
    <StatusBar
      style={
        Platform.OS === 'android'
          ? scheme === 'dark'
            ? 'light'
            : 'dark'
          : 'auto'
      }
    />
  );
}

// Bootstraps secure auth persistence and wires global providers.
export default function RootLayout() {
  const [isBootstrapComplete, setIsBootstrapComplete] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function bootstrapApp() {
      await bootstrap();
      if (!cancelled) {
        setIsBootstrapComplete(true);
      }
    }

    bootstrapApp();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <AppThemeProvider>
        <BottomSheetModalProvider>
          <ActionSheetProvider>
            <HapticProvider>
              <LoadingProvider>
                <AuthProvider>
                  <FilterProvider>
                    <GlobalStatusBar />
                    <RootNavigation isBootstrapComplete={isBootstrapComplete} />
                  </FilterProvider>
                </AuthProvider>
              </LoadingProvider>
            </HapticProvider>
          </ActionSheetProvider>
        </BottomSheetModalProvider>
      </AppThemeProvider>
    </GestureHandlerRootView>
  );
}
