import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import {Platform, View, ActivityIndicator, StyleSheet, Modal} from 'react-native';
import {ThemedText} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {makeStyleFactory} from '@/utils/style-factory';
import {useTheme} from './theme-provider';

interface LoadingContextValue {
  isLoading: boolean;
  message: string;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextValue | undefined>(
  undefined,
);

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
}

interface LoadingProviderProps {
  children: ReactNode;
}

export function LoadingProvider({children}: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('Loading...');
  const {theme, ds} = useTheme();

  const styles = createStyles(theme, ds);

  const showLoading = useCallback((msg?: string) => {
    setMessage(msg ?? 'Loading...');
    setIsLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const contextValue: LoadingContextValue = {
    isLoading,
    message,
    showLoading,
    hideLoading,
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
      {Platform.OS === 'web' && isLoading && (
        <Modal
          visible={isLoading}
          transparent
          animationType="fade"
          statusBarTranslucent
        >
          <View style={styles.overlay}>
            <View style={styles.container}>
              <ActivityIndicator size="large" color={theme.primary} />
              <ThemedText variant="body" style={styles.message}>
                {message}
              </ThemedText>
            </View>
          </View>
        </Modal>
      )}
    </LoadingContext.Provider>
  );
}

const createStyles = makeStyleFactory(
  (theme: ThemeShape, ds: DSShape) =>
    StyleSheet.create({
      overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 99999,
      },
      container: {
        backgroundColor: theme.card,
        borderRadius: ds.borderRadius.lg,
        padding: ds.spacing.xxl,
        minWidth: 150,
        alignItems: 'center',
        gap: ds.spacing.md,
        ...ds.shadows.lg,
      },
      message: {
        textAlign: 'center',
        color: theme.text,
      },
    }),
  (theme, ds) => themeKey(theme, ds),
);
