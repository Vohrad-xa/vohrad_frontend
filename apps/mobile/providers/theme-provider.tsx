import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';

import { NavigationThemes, Tokens, type ColorScheme } from '@/constants/colors';
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

  const toggle = useCallback(() => {
    setScheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const tokens = useMemo(() => Tokens[scheme], [scheme]);
  const value = useMemo(() => ({ scheme, setScheme, toggle, tokens }), [scheme, toggle, tokens]);

  const navTheme = NavigationThemes[scheme];

  return (
    <NavigationThemeProvider value={navTheme}>
      <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    </NavigationThemeProvider>
  );
}
