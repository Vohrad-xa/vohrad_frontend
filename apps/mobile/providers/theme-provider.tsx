import React, {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {Animated, Easing, StyleSheet} from 'react-native';
import {ThemeProvider as NavigationThemeProvider} from '@react-navigation/native';
import {NavigationThemes, Tokens, type ColorScheme} from '@/constants/colors';
import {DesignSystem} from '@/constants/typography';
import {useColorScheme as useRNColorScheme} from '@/hooks/use-color-scheme';
import * as storage from '@/utils/storage';

type ThemeContextValue = {
  scheme: ColorScheme;
  setScheme: (scheme: ColorScheme) => void;
  toggle: () => void;
  tokens: typeof Tokens.light | typeof Tokens.dark;
  theme: typeof Tokens.light | typeof Tokens.dark;
  ds: typeof DesignSystem;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within AppThemeProvider');
  }
  return ctx;
}

export function AppThemeProvider({children}: {children: React.ReactNode}) {
  const systemScheme = useRNColorScheme() ?? 'light';
  const [scheme, setScheme] = useState<ColorScheme>(systemScheme);
  const [hydrated, setHydrated] = useState(false);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const [overlayColor, setOverlayColor] = useState<string | null>(null);
  const isAnimating = useRef(false);

  const STORAGE_KEY = 'app.theme.scheme';

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const saved = (await storage.getItem(STORAGE_KEY)) as ColorScheme | null;
        if (mounted && (saved === 'light' || saved === 'dark')) {
          setScheme(saved);
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
    storage.setItem(STORAGE_KEY, scheme).catch(() => {});
  }, [scheme]);

  const toggle = useCallback(() => {
    if (isAnimating.current) {
      return;
    }

    const nextScheme: ColorScheme = scheme === 'light' ? 'dark' : 'light';
    const currentBackground = Tokens[scheme].background;

    isAnimating.current = true;
    overlayOpacity.stopAnimation();
    overlayOpacity.setValue(1);
    setOverlayColor(currentBackground);

    setScheme(nextScheme);

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

  const tokens = useMemo(() => Tokens[scheme], [scheme]);
  const theme = useMemo(() => Tokens[scheme], [scheme]);
  const value = useMemo(
    () => ({
      scheme,
      setScheme,
      toggle,
      tokens,
      theme,
      ds: DesignSystem,
    }),
    [scheme, toggle, tokens, theme],
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
                {backgroundColor: overlayColor, opacity: overlayOpacity, pointerEvents: 'none'},
              ]}
            />
          ) : null}
        </React.Fragment>
      </ThemeContext.Provider>
    </NavigationThemeProvider>
  );
}
