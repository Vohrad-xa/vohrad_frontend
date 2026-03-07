import React, {useCallback, useEffect} from 'react';
import {Platform} from 'react-native';
import {ActionSheetProvider} from '@expo/react-native-action-sheet';
import {TrueSheetProvider} from '@lodev09/react-native-true-sheet';
import {useNavigationState} from '@react-navigation/native';
import {QueryProvider} from '@sykamore/store';
import {Stack} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {
  KeyboardProvider,
  KeyboardController,
} from 'react-native-keyboard-controller';
import {ThemedStatusBar} from '@/components/ui';
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

function RootNavigation({isBootstrapComplete}: {isBootstrapComplete: boolean}) {
  const {isAuthenticated, authReady} = useAuth();

  const ready = isBootstrapComplete && authReady;

  useEffect(() => {
    if (ready) {
      void SplashScreen.hideAsync();
    }
  }, [ready]);

  useNavigationState(
    useCallback((state) => {
      KeyboardController.dismiss({animated: true});
      return state;
    }, []),
  );

  if (!ready) return null;

  return (
    <Stack screenOptions={{headerShown: false}}>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(tabs)" />
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
  const isBootstrapComplete = useBootstrap();

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <KeyboardProvider>
        <QueryProvider>
          <AppThemeProvider>
            <PaperThemeProvider>
              <HapticProvider>
                <TrueSheetProvider>
                  <ActionSheetProvider>
                    <NetworkProvider>
                      <LoadingProvider>
                        <AuthProvider>
                          <AttachmentProvider>
                            <ThemedStatusBar />
                            <RootNavigation
                              isBootstrapComplete={isBootstrapComplete}
                            />
                            <NetworkBanner />
                          </AttachmentProvider>
                        </AuthProvider>
                      </LoadingProvider>
                    </NetworkProvider>
                  </ActionSheetProvider>
                </TrueSheetProvider>
              </HapticProvider>
            </PaperThemeProvider>
          </AppThemeProvider>
        </QueryProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
