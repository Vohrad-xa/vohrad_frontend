import {Platform} from 'react-native';
import {ActionSheetProvider} from '@expo/react-native-action-sheet';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {Stack} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {KeyboardProvider} from 'react-native-keyboard-controller';
import {AttachmentProvider} from '@/features/attachments';
import {NetworkProvider} from '@/features/network';
import {NetworkBanner} from '@/features/network/components/network-banner';
import {useBootstrap} from '@/hooks/use-bootstrap';
import {
  PaperThemeProvider,
  AppThemeProvider,
  AuthProvider,
  useAuth,
  LoadingProvider,
  HapticProvider,
} from '@/providers';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootNavigation({isBootstrapComplete}: {isBootstrapComplete: boolean}) {
  const {isAuthenticated, authReady} = useAuth();

  const ready = isBootstrapComplete && authReady;

  if (!ready) return null;

  return (
    <Stack screenOptions={{headerShown: false}}>
      <Stack.Screen name="email/confirm" />
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(app)" />
        <Stack.Screen
          name="(modals)"
          options={{
            presentation:
              Platform.OS === 'ios' ? 'modal' : 'containedTransparentModal',
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
  const isBootstrapComplete = useBootstrap();

  return (
    <GestureHandlerRootView>
      <KeyboardProvider>
        <QueryClientProvider client={queryClient}>
          <AppThemeProvider>
            <PaperThemeProvider>
              <HapticProvider>
                <ActionSheetProvider>
                  <NetworkProvider>
                    <LoadingProvider>
                      <AuthProvider>
                        <AttachmentProvider>
                          <RootNavigation
                            isBootstrapComplete={isBootstrapComplete}
                          />
                          <NetworkBanner />
                        </AttachmentProvider>
                      </AuthProvider>
                    </LoadingProvider>
                  </NetworkProvider>
                </ActionSheetProvider>
              </HapticProvider>
            </PaperThemeProvider>
          </AppThemeProvider>
        </QueryClientProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
