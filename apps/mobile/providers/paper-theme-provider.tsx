import React, {useMemo} from 'react';
import {
  MD3DarkTheme,
  MD3LightTheme,
  Provider as PaperProvider,
} from 'react-native-paper';
import {Palette} from '@/constants';
import {Icon, type IconName} from '@/utils/icons';
import {useTheme} from './theme-provider';

export function PaperThemeProvider({children}: {children: React.ReactNode}) {
  const {scheme, theme, ds} = useTheme();

  const paperTheme = useMemo(() => {
    const base = scheme === 'dark' ? MD3DarkTheme : MD3LightTheme;
    const isDark = scheme === 'dark';

    return {
      ...base,
      roundness: ds.borderRadius.lg,

      colors: {
        ...base.colors,

        // Brand / accent roles
        primary: theme.tint,
        onPrimary: Palette.white,
        primaryContainer: isDark ? Palette.slateblue : Palette.lightBlue,
        onPrimaryContainer: isDark ? Palette.white : Palette.bluepurple,

        secondary: theme.tertiary,
        onSecondary: Palette.white,
        secondaryContainer: theme.secondaryContainer,
        onSecondaryContainer: theme.text,

        tertiary: isDark ? Palette.Greige : Palette.bluepurple,
        onTertiary: isDark ? Palette.slate : Palette.white,
        tertiaryContainer: isDark ? Palette.gray[850] : Palette.mistBlue,
        onTertiaryContainer: theme.text,

        // Error
        error: Palette.red,
        onError: Palette.white,
        errorContainer: theme.modalBackground,
        onErrorContainer: theme.accentRed,

        // App surfaces
        background: theme.background,
        onBackground: theme.text,

        surface: theme.card,
        onSurface: theme.text,

        surfaceVariant: isDark ? Palette.midnight : Palette.white,
        onSurfaceVariant: theme.icon,

        // Borders / separators
        outline: theme.border,
        outlineVariant: theme.divider,

        // Utility
        shadow: Palette.black,
        scrim: Palette.black,
        backdrop: isDark ? 'rgba(0,0,0,0.45)' : 'rgba(17,24,28,0.32)',

        inverseSurface: isDark ? Palette.fog : Palette.slate,
        inverseOnSurface: isDark ? Palette.slate : Palette.white,
        inversePrimary: theme.tint,

        // Disabled states
        surfaceDisabled: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        onSurfaceDisabled: isDark
          ? 'rgba(255,255,255,0.38)'
          : 'rgba(0,0,0,0.38)',

        // Elevation colors
        elevation: {
          ...base.colors.elevation,
          level0: theme.background,
          level1: isDark ? Palette.gray[900] : Palette.white,
          level2: isDark ? Palette.midnight : Palette.offWhite,
          level3: isDark ? Palette.gray[850] : Palette.fog,
          level4: isDark ? Palette.gray[800] : Palette.cloud,
          level5: isDark ? Palette.gray[750] : Palette.mistBlue,
        },
      },
    };
  }, [scheme, theme, ds.borderRadius.lg]);

  return (
    <PaperProvider
      theme={paperTheme}
      settings={{
        rippleEffectEnabled: true,
        icon: ({name, color, size, direction, testID}) => (
          <Icon
            name={name as IconName}
            color={color}
            size={size}
            testID={testID}
            style={
              direction === 'rtl' ? {transform: [{scaleX: -1}]} : undefined
            }
          />
        ),
      }}
    >
      {children}
    </PaperProvider>
  );
}
