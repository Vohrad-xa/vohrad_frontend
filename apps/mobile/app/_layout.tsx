import {useEffect} from 'react';
import {ActionSheetProvider} from '@expo/react-native-action-sheet';
import * as SplashScreen from 'expo-splash-screen';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import LoginScreen from '@/features/auth/login-screen';
import {AuthLayout} from '@/layouts/auth-layout';
import {MainLayout} from '@/layouts/main-layout';
import {AppThemeProvider, AuthProvider, useAuth} from '@/providers';

SplashScreen.preventAutoHideAsync().catch(() => {});

export const unstable_settings = {
  anchor: '(tabs)',
};

function AppContent() {
  const {isAuthenticated} = useAuth();

  if (!isAuthenticated) {
    return (
      <AuthLayout>
        <LoginScreen />
      </AuthLayout>
    );
  }

  return <MainLayout />;
}

function InnerApp() {
  return <AppContent />;
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
            <InnerApp />
          </AuthProvider>
        </AppThemeProvider>
      </ActionSheetProvider>
    </GestureHandlerRootView>
  );
}
