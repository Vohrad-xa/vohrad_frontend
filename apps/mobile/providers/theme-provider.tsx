import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Appearance,
  Platform,
  useWindowDimensions,
  PixelRatio,
} from 'react-native';
import {ThemeProvider as NavigationThemeProvider} from '@react-navigation/native';
import {
  NavigationThemes,
  Tokens,
  type ColorScheme,
  type ThemePreference,
} from '@/constants/colors';
import {createDesignSystem} from '@/constants/typography';
import {useColorScheme as useRNColorScheme} from '@/hooks/use-color-scheme';
import * as storage from '@/utils/storage';

type ThemeContextValue = {
  scheme: ColorScheme;
  preference: ThemePreference;
  setScheme: (preference: ThemePreference) => void;
  toggle: () => void;
  theme: typeof Tokens.light | typeof Tokens.dark;
  ds: ReturnType<typeof createDesignSystem>;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within AppThemeProvider');
  }
  return ctx;
}

interface AppThemeProviderProps {
  children: React.ReactNode;
}

export function AppThemeProvider({children}: AppThemeProviderProps) {
  const systemScheme = useRNColorScheme() ?? 'light';
  const [preference, setPreference] = useState<ThemePreference>('system');
  const [hydrated, setHydrated] = useState(false);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const [overlayColor, setOverlayColor] = useState<string | null>(null);
  const isAnimating = useRef(false);
  const scheme: ColorScheme =
    preference === 'system' ? systemScheme : preference;

  // Reactive design system - updates on dimension/font scale changes
  const {width, height} = useWindowDimensions();
  const fontScale = PixelRatio.getFontScale();
  const ds = useMemo(
    () => createDesignSystem(width, height, fontScale),
    [width, height, fontScale],
  );

  const STORAGE_KEY = 'app.theme.scheme';

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const saved = (await storage.getItem(
          STORAGE_KEY,
        )) as ThemePreference | null;
        if (
          mounted &&
          (saved === 'light' || saved === 'dark' || saved === 'system')
        ) {
          setPreference(saved);
        }
      } finally {
        if (mounted) {
          setHydrated(true);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (hydrated) {
      storage.setItem(STORAGE_KEY, preference).catch((error) => {
        console.warn('Failed to save theme preference:', error);
      });
    }
  }, [preference, hydrated]);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      Appearance.setColorScheme(preference === 'system' ? null : preference);
    }
  }, [preference]);

  const toggle = useCallback(() => {
    if (isAnimating.current) {
      return;
    }

    const nextPreference: ThemePreference =
      scheme === 'light' ? 'dark' : 'light';
    const currentBackground = Tokens[scheme].background;

    isAnimating.current = true;
    overlayOpacity.stopAnimation();
    overlayOpacity.setValue(1);
    setOverlayColor(currentBackground);

    setPreference(nextPreference);

    Animated.timing(overlayOpacity, {
      toValue: 0,
      duration: 320,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start(() => {
      isAnimating.current = false;
      setOverlayColor(null);
    });
  }, [overlayOpacity, scheme]);

  const theme = useMemo(() => Tokens[scheme], [scheme]);
  const value = useMemo(
    () => ({
      scheme,
      preference,
      setScheme: setPreference,
      toggle,
      theme,
      ds,
    }),
    [scheme, preference, toggle, theme, ds],
  );

  const navTheme = NavigationThemes[scheme];

  if (!hydrated) {
    return null;
  }

  return (
    <NavigationThemeProvider value={navTheme}>
      <ThemeContext.Provider value={value}>
        <React.Fragment>
          {children}
          {overlayColor ? (
            <Animated.View
              style={[
                StyleSheet.absoluteFillObject,
                {
                  backgroundColor: overlayColor,
                  opacity: overlayOpacity,
                  pointerEvents: 'none',
                },
              ]}
            />
          ) : null}
        </React.Fragment>
      </ThemeContext.Provider>
    </NavigationThemeProvider>
  );
}
