import React, {useMemo} from 'react';
import {
  MD3DarkTheme,
  MD3LightTheme,
  Provider as PaperProvider,
} from 'react-native-paper';
import {Palette} from '@/constants';
import {useTheme} from './theme-provider';

export function PaperThemeProvider({children}: {children: React.ReactNode}) {
  const {scheme, theme} = useTheme();

  const paperTheme = useMemo(() => {
    const base = scheme === 'dark' ? MD3DarkTheme : MD3LightTheme;

    const surfaceBase = theme.card;

    return {
      ...base,
      colors: {
        ...base.colors,

        primary: theme.primary,
        onPrimary: theme.text,
        primaryContainer: theme.secondary,
        onPrimaryContainer: theme.input,

        secondary: theme.tertiary,
        onSecondary: theme.text,
        secondaryContainer: theme.tabIndicator,
        onSecondaryContainer: theme.text,

        // Screens / surfaces
        background: theme.background,
        surface: surfaceBase,
        onSurface: theme.text,
        surfaceVariant: theme.modalBackground,
        onSurfaceVariant: theme.muted,

        // Surface with elevation
        elevation: {
          ...base.colors.elevation,
          level0: theme.background,
          level1: surfaceBase,
          level2: surfaceBase,
          level3: surfaceBase,
          level4: surfaceBase,
          level5: surfaceBase,
        },

        // Errors
        error: Palette.red,
        onError: theme.modalBackground,
        errorContainer: Palette.white,
        backdrop: theme.modalBackground,
      },
    };
  }, [scheme, theme]);

  return (
    <PaperProvider theme={paperTheme} settings={{rippleEffectEnabled: true}}>
      {children}
    </PaperProvider>
  );
}
