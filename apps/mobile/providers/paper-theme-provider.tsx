import React, {useMemo} from 'react';
import {MD3DarkTheme, MD3LightTheme, PaperProvider} from 'react-native-paper';
import {Palette} from '@/constants';
import {useTheme} from './theme-provider';

export function PaperThemeProvider({children}: {children: React.ReactNode}) {
  const {scheme, theme} = useTheme();

  const paperTheme = useMemo(() => {
    const base = scheme === 'dark' ? MD3DarkTheme : MD3LightTheme;

    return {
      ...base,
      colors: {
        ...base.colors,
        primary: theme.tertiary,
        onPrimary: theme.text,
        primaryContainer: theme.secondary,
        onPrimaryContainer: theme.input,
        background: theme.background,
        secondary: theme.webbackground,
        onSecondary: theme.text,
        secondaryContainer: theme.accentDeepblue, // bottom tab buttons container
        onSecondaryContainer: Palette.white,
        surface: theme.background, // outlined cards backgrounds
        onSurface: theme.text, // main text color
        surfaceVariant: theme.surface, // button backgrounds, input backgrounds
        onSurfaceVariant: theme.muted,
        errorContainer: Palette.white,
        error: theme.destructive,
        onError: theme.background,
        backdrop: theme.backdrop,
      },
    };
  }, [scheme, theme]);

  return (
    <PaperProvider theme={paperTheme} settings={{rippleEffectEnabled: true}}>
      {children}
    </PaperProvider>
  );
}
