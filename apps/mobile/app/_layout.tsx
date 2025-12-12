import {useEffect} from 'react';
import {Platform} from 'react-native';
import {ActionSheetProvider} from '@expo/react-native-action-sheet';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {Stack, useRootNavigationState} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {KeyboardProvider} from 'react-native-keyboard-controller';
import {PaperProvider} from 'react-native-paper';
import {LoadingOverlay} from '@/components/ui';
import {AttachmentProvider} from '@/features/attachments/providers/attachment-provider';
import {useBootstrap} from '@/hooks/use-bootstrap';
import {NetworkProvider} from '@/modules/network';
import {NetworkBanner} from '@/modules/network/components/network-banner';
import {
  AppThemeProvider,
  AuthProvider,
  useAuth,
  LoadingProvider,
  HapticProvider,
} from '@/providers';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

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
            presentation: Platform.OS === 'ios' ? 'modal' : 'transparentModal',
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
        <QueryClientProvider client={queryClient}>
          <AppThemeProvider>
            <PaperProvider>
              <HapticProvider>
                <ActionSheetProvider>
                  <NetworkProvider>
                    <LoadingProvider>
                      <AuthProvider>
                        <AttachmentProvider>
                          <RootNavigation
                            isBootstrapComplete={useBootstrap()}
                          />
                          <NetworkBanner />
                        </AttachmentProvider>
                      </AuthProvider>
                    </LoadingProvider>
                  </NetworkProvider>
                </ActionSheetProvider>
              </HapticProvider>
            </PaperProvider>
          </AppThemeProvider>
        </QueryClientProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
