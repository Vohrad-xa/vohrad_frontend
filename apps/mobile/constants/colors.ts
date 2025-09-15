/**
 * Centralized color system for the mobile app.
 * - Palette: raw colors and scales
 * - Tokens: semantic colors per theme (light/dark)
 * - Helpers: types and utilities for consuming tokens
 */

export const Palette = {
  gray: {
    50: '#F2F2F7',
    100: '#E5E5EA',
    200: '#D1D1D6',
    300: '#C7C7CC',
    400: '#A1A1AA',
    500: '#8E8E93',
    600: '#636366',
    700: '#48484A',
    800: '#1C1C1E',
    900: '#0B0B0B',
  },
  brand: {
    blue: '#007AFF',
    blueDark: '#0A84FF',
    green: '#34C759',
    yellow: '#FFD60A',
    orange: '#FF9500',
  },
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const Tokens = {
  light: {
    // Surfaces & text
    background: Palette.white,
    surface: Palette.gray[50],
    text: '#11181C',
    muted: '#6C6C70',
    border: Palette.gray[200],

    // Brand & accents
    primary: Palette.brand.blue,
    primaryForeground: Palette.white,
    accent: Palette.brand.blue,
    accentBlue: Palette.brand.blue,
    accentGreen: Palette.brand.green,
    accentYellow: Palette.brand.yellow,
    accentOrange: Palette.brand.orange,

    // UI
    icon: '#6C6C70',
    tint: Palette.brand.blue,
    tabIconDefault: '#6C6C70',
    tabIconSelected: Palette.brand.blue,
    card: Palette.white,
    input: Palette.white,
    ring: Palette.brand.blue,

    // Icon semantic variants
    iconInfo: Palette.brand.blue,
    iconPositive: Palette.brand.green,
    iconCaution: Palette.brand.yellow,
    iconWarning: Palette.brand.orange,
  },
  dark: {
    // Surfaces & text
    background: Palette.gray[900],
    surface: Palette.gray[800],
    text: '#ECEDEE',
    muted: '#A1A1AA',
    border: '#262626',

    // Brand & accents
    primary: Palette.brand.blueDark,
    primaryForeground: Palette.gray[900],
    accent: Palette.brand.blueDark,
    accentBlue: Palette.brand.blueDark,
    accentGreen: Palette.brand.green,
    accentYellow: Palette.brand.yellow,
    accentOrange: Palette.brand.orange,

    // UI
    icon: '#A1A1AA',
    tint: Palette.brand.blueDark,
    tabIconDefault: '#A1A1AA',
    tabIconSelected: Palette.brand.blueDark,
    card: '#111214',
    input: '#111214',
    ring: Palette.brand.blueDark,

    // Icon semantic variants
    iconInfo: Palette.brand.blueDark,
    iconPositive: Palette.brand.green,
    iconCaution: Palette.brand.yellow,
    iconWarning: Palette.brand.orange,
  },
} as const;

export type ColorScheme = keyof typeof Tokens; // 'light' | 'dark'
export type TokenName = keyof typeof Tokens.light;

export function getColor(scheme: ColorScheme, token: TokenName) {
  return Tokens[scheme][token];
}

// Optional: React Navigation compatible themes
const NavigationFonts = {
  regular: { fontFamily: 'System', fontWeight: '400' as const },
  medium: { fontFamily: 'System', fontWeight: '500' as const },
  bold: { fontFamily: 'System', fontWeight: '700' as const },
  heavy: { fontFamily: 'System', fontWeight: '800' as const },
} as const;

export const NavigationThemes = {
  light: {
    dark: false,
    colors: {
      primary: Tokens.light.tint,
      background: Tokens.light.background,
      card: Tokens.light.card,
      text: Tokens.light.text,
      border: Tokens.light.border,
      notification: Tokens.light.primary,
    },
    fonts: NavigationFonts,
  },
  dark: {
    dark: true,
    colors: {
      primary: Tokens.dark.tint,
      background: Tokens.dark.background,
      card: Tokens.dark.card,
      text: Tokens.dark.text,
      border: Tokens.dark.border,
      notification: Tokens.dark.primary,
    },
    fonts: NavigationFonts,
  },
} as const;
