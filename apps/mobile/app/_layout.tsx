import {useEffect} from 'react';
import {Platform} from 'react-native';
import {ActionSheetProvider} from '@expo/react-native-action-sheet';
import {Stack, useRootNavigationState} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {KeyboardProvider} from 'react-native-keyboard-controller';
import {LoadingOverlay} from '@/components/ui';
import {useBootstrap} from '@/hooks/use-bootstrap';
import {
  AppThemeProvider,
  AuthProvider,
  useAuth,
  LoadingProvider,
  HapticProvider,
} from '@/providers';

SplashScreen.preventAutoHideAsync();

function RootNavigation({isBootstrapComplete}: {isBootstrapComplete: boolean}) {
  const {isAuthenticated} = useAuth();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (navigationState?.key && isBootstrapComplete) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [navigationState?.key, isBootstrapComplete]);

  if (!isBootstrapComplete) {
    return <LoadingOverlay fullScreen />;
  }

  return (
    <Stack screenOptions={{headerShown: false}}>
      <Stack.Screen name="email/confirm" />
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(app)" />
        <Stack.Screen
          name="(modals)"
          options={{
            presentation:
              Platform.OS !== 'android' ? 'modal' : 'transparentModal',
          }}
        />
      </Stack.Protected>

      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <KeyboardProvider>
        <AppThemeProvider>
          <HapticProvider>
            <ActionSheetProvider>
              <LoadingProvider>
                <AuthProvider>
                  <RootNavigation isBootstrapComplete={useBootstrap()} />
                </AuthProvider>
              </LoadingProvider>
            </ActionSheetProvider>
          </HapticProvider>
        </AppThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
