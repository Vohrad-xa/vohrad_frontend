import {generateVersion} from '../utils/versioning';

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
    750: '#30302E',
    800: '#1C1C1E',
    900: '#0B0B0B',
  },
  brand: {
    blue: '#0A84FF',
    green: '#34C759',
    yellow: '#FFD60A',
    orange: '#FF9500',
    red: '#ef4444',
    redDark: '#dc2626',
    purple: '#6a24c4ff',
    teal: '#14B8A6',
    indigo: '#4F46E5',
  },
  white: '#FFFFFF',
  black: '#000000',
  Dbackground: '#262624',
  Lbackground: '#FAF9F5',
  Obsidian: '#171717ff',
  // Obsidian: '#111214',
  mushroom: '#9C9A92',
  Onyx: '#1F1E1D',
  Alabaster: '#F5F4ED',
  terracotta: '#C6613F',
  Greige: '#C2C0B6',
  cardDarkGlass: 'rgba(255, 255, 255, 0.1)',
  cardLightGlass: 'rgba(97, 94, 94, 0.16)',
  glassTintLight: 'rgba(255, 255, 255, 0.79)',
  glassTintDark: 'rgba(186, 185, 185, 0.06)',
} as const;

const _Tokens = {
  light: {
    // Surfaces & text
    background: Palette.Lbackground,
    text: '#11181C',
    surface: Palette.gray[50],
    border: Palette.gray[200],
    divider: Palette.gray[300],
    lightdivider: Palette.gray[100],
    muted: Palette.gray[600],
    navigationBar: Palette.white,

    // Brand & accents
    primary: Palette.terracotta,
    primaryForeground: Palette.white,
    accentBlue: Palette.brand.blue,
    accentGreen: Palette.brand.green,
    accentYellow: Palette.brand.yellow,
    accentOrange: Palette.brand.orange,
    accentTeal: Palette.brand.teal,
    accentIndigo: Palette.brand.indigo,
    destructive: Palette.brand.red,
    destructiveForeground: Palette.white,

    // UI
    icon: Palette.black,
    label: Palette.gray[600],
    tint: Palette.brand.blue,
    tabIconSelected: Palette.brand.blue,
    card: Palette.cardLightGlass,
    input: Palette.white,
    purple: Palette.brand.purple,
    iosLightGray: Palette.gray[50],
    iosPlaceholder: Palette.gray[400],
    overlay: Palette.gray[200],
    iconInfo: Palette.brand.blue,
    iconPositive: Palette.brand.green,
    iconCaution: Palette.brand.yellow,
    iconWarning: Palette.brand.orange,
    iconDanger: Palette.brand.red,
    sidebarBackground: Palette.Alabaster,
    secondary: Palette.Obsidian,
    glassTint: Palette.glassTintLight,
    quickActionIcon: Palette.Lbackground,

    // Toggle
    toggleTrackOff: Palette.Greige,
    toggleTrackOn: Palette.terracotta,
    toggleThumb: Palette.white,
  },

  dark: {
    // Surfaces & text
    background: Palette.Dbackground,
    surface: Palette.gray[800],
    text: '#ECEDEE',
    muted: Palette.gray[500],
    border: Palette.gray[700],
    divider: Palette.gray[600],
    lightdivider: Palette.gray[750],
    navigationBar: Palette.Onyx,

    // Brand & accents
    primary: Palette.Greige,
    primaryForeground: Palette.gray[900],
    accentBlue: Palette.brand.blue,
    accentGreen: Palette.brand.green,
    accentYellow: Palette.brand.yellow,
    accentOrange: Palette.brand.orange,
    accentTeal: Palette.brand.teal,
    accentIndigo: Palette.brand.indigo,
    destructive: Palette.brand.redDark,
    destructiveForeground: Palette.white,

    // UI
    icon: Palette.mushroom,
    label: Palette.mushroom,
    tint: Palette.brand.blue,
    tabIconSelected: Palette.brand.blue,
    card: Palette.cardDarkGlass,
    input: Palette.gray[750],
    purple: Palette.brand.purple,
    iosLightGray: Palette.gray[700],
    iosPlaceholder: Palette.gray[500],
    overlay: Palette.gray[600],
    iconInfo: Palette.brand.blue,
    iconPositive: Palette.brand.green,
    iconCaution: Palette.brand.yellow,
    iconWarning: Palette.brand.orange,
    iconDanger: Palette.brand.red,
    sidebarBackground: Palette.Onyx,
    secondary: Palette.Greige,
    glassTint: Palette.glassTintDark,
    quickActionIcon: Palette.Dbackground,
    toggleTrackOff: Palette.gray[400],
    toggleTrackOn: Palette.brand.green,
    toggleThumb: Palette.white,
  },
} as const;

const lightVersion = generateVersion(_Tokens.light);
const darkVersion = generateVersion(_Tokens.dark);

export const Tokens = {
  light: {..._Tokens.light, version: lightVersion},
  dark: {..._Tokens.dark, version: darkVersion},
} as const;

export type ColorScheme = keyof typeof _Tokens; // 'light' | 'dark'
export type ThemePreference = ColorScheme | 'system'; // 'light' | 'dark' | 'system'
export type TokenName = keyof typeof _Tokens.light;

// Optional: React Navigation compatible themes
const NavigationFonts = {
  regular: {fontFamily: 'System', fontWeight: '400' as const},
  medium: {fontFamily: 'System', fontWeight: '500' as const},
  bold: {fontFamily: 'System', fontWeight: '700' as const},
  heavy: {fontFamily: 'System', fontWeight: '800' as const},
} as const;

export const NavigationThemes = {
  light: {
    dark: false,
    colors: {
      primary: _Tokens.light.tint,
      background: _Tokens.light.background,
      card: Palette.white,
      text: _Tokens.light.text,
      border: _Tokens.light.border,
      notification: _Tokens.light.primary,
    },
    fonts: NavigationFonts,
  },
  dark: {
    dark: true,
    colors: {
      primary: _Tokens.dark.tint,
      background: _Tokens.dark.background,
      card: _Tokens.dark.card,
      text: _Tokens.dark.text,
      border: _Tokens.dark.border,
      notification: _Tokens.dark.primary,
    },
    fonts: NavigationFonts,
  },
} as const;
