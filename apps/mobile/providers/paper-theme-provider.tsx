import React, {useMemo} from 'react';
import {MD3DarkTheme, MD3LightTheme, PaperProvider} from 'react-native-paper';
import {useTheme} from './theme-provider';

export function PaperThemeProvider({children}: {children: React.ReactNode}) {
  const {scheme, theme} = useTheme();

  const paperTheme = useMemo(() => {
    const base = scheme === 'dark' ? MD3DarkTheme : MD3LightTheme;

    return {
      ...base,
      colors: {
        ...base.colors,
        primary: theme.accentBlue,
        onPrimary: theme.primaryForeground,
        background: theme.background,
        surface: theme.input,
        onSurface: theme.text,
        onSurfaceVariant: theme.iconInfo,
        outline: theme.border,
        outlineVariant: theme.divider,
        secondary: theme.secondary,
        error: theme.destructive,
        onError: theme.destructiveForeground,
        backdrop: theme.backdrop,
      },
    };
  }, [scheme, theme]);

  return <PaperProvider theme={paperTheme}>{children}</PaperProvider>;
}
