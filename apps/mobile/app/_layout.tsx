import {useEffect} from 'react';
import * as SplashScreen from 'expo-splash-screen';
import {ActionSheetProvider} from '@expo/react-native-action-sheet';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {AppThemeProvider, AuthProvider, useAuth} from '@/providers';
import {MainLayout} from '@/layouts/main-layout';
import {AuthLayout} from '@/layouts/auth-layout';
import LoginScreen from './login';

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
