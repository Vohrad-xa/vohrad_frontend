import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';

import { NavigationThemes, Tokens, type ColorScheme } from '@/constants/colors';
import * as storage from '@/utils/storage';
import { useColorScheme as useRNColorScheme } from '@/hooks/use-color-scheme';

type ThemeContextValue = {
  scheme: ColorScheme;
  setScheme: (scheme: ColorScheme) => void;
  toggle: () => void;
  tokens: typeof Tokens.light | typeof Tokens.dark;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within AppThemeProvider');
  return ctx;
}

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useRNColorScheme() ?? 'light';
  const [scheme, setScheme] = useState<ColorScheme>(systemScheme);
  const [hydrated, setHydrated] = useState(false);

  const STORAGE_KEY = 'app.theme.scheme';

  // Load saved scheme (web or native) once
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const saved = (await storage.getItem(STORAGE_KEY)) as ColorScheme | null;
        if (mounted && (saved === 'light' || saved === 'dark')) {
          setScheme(saved);
        }
      } finally {
        if (mounted) setHydrated(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Persist on change
  useEffect(() => {
    storage.setItem(STORAGE_KEY, scheme).catch(() => {});
  }, [scheme]);

  const toggle = useCallback(() => {
    setScheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const tokens = useMemo(() => Tokens[scheme], [scheme]);
  const value = useMemo(() => ({ scheme, setScheme, toggle, tokens }), [scheme, toggle, tokens]);

  const navTheme = NavigationThemes[scheme];

  if (!hydrated) {
    // Avoid theme flicker on initial load
    return null;
  }

  return (
    <NavigationThemeProvider value={navTheme}>
      <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    </NavigationThemeProvider>
  );
}
