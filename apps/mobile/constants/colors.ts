import {generateVersion} from '../utils/versioning';

export const Palette = {
  gray: {
    50: '#F2F2F2',
    100: '#E5E5EA',
    200: '#D1D1D6',
    300: '#C7C7CC',
    400: '#A1A1AA',
    500: '#8E8E93',
    600: '#636366',
    650: '#2C2C2E',
    700: '#48484A',
    750: '#30302E',
    800: '#1C1C1E',
    900: '#0B0B0B',
  },
  brand: {
    terracotta: '#C6613F',
    blue: '#0A84FF',
    lightBlue: '#6AC7F1',
    green: '#36ba06ff',
    yellow: '#FFD60A',
    orange: '#FF9500',
    red: '#ef4444',
    redDark: '#dc2626',
    purple: '#6a24c4ff',
    bluepurple: '#10385bff',
    teal: '#14B8A6',
    indigo: '#4F46E5',
    white: '#FFFFFE',
    black: '#000000',
  },
  Dbackground: '#262624',
  Lbackground: '#FAF9F5',
  Mbackground: '#F2F2F6',
  Obsidian: '#171717ff',
  mushroom: '#9C9A92',
  Onyx: '#1F1E1D',
  Alabaster: '#F5F4ED',
  Greige: '#C2C0B6',
  cardDarkGlass: 'rgba(255, 255, 255, 0.1)',
  cardLightGlass: 'rgba(97, 94, 94, 0.16)',
  glassTintLight: 'rgba(20, 20, 20, 0.27)',
  glassTintDark: 'rgba(186, 185, 185, 0.72)',
  placeholderGray: '#8e8e9385',
} as const;

const _Tokens = {
  light: {
    // Surfaces & text
    background: Palette.brand.white,
    webbackground: Palette.Lbackground,
    text: '#11181C',
    textlabel: Palette.gray[700],
    surface: Palette.gray[50],
    border: Palette.gray[200],
    divider: Palette.gray[300],
    lightdivider: Palette.gray[100],
    muted: Palette.gray[600],
    inputPlaceholder: Palette.placeholderGray,

    // Brand & accents
    primary: Palette.brand.terracotta,
    primaryForeground: Palette.brand.white,
    accentBlue: Palette.brand.blue,
    accentLightBlue: Palette.brand.lightBlue,
    accentGreen: Palette.brand.green,
    accentYellow: Palette.brand.yellow,
    accentOrange: Palette.brand.orange,
    accentTeal: Palette.brand.teal,
    accentIndigo: Palette.brand.indigo,
    destructive: Palette.brand.red,
    destructiveForeground: Palette.brand.white,

    // UI
    icon: Palette.gray[600],
    headerAndroid: Palette.brand.bluepurple,
    label: Palette.gray[600],
    tint: Palette.brand.blue,
    tabIconSelected: Palette.brand.blue,
    card: Palette.cardLightGlass,
    input: Palette.brand.white,
    purple: Palette.brand.purple,
    iosLightGray: Palette.gray[50],
    iosPlaceholder: Palette.gray[400],
    overlay: Palette.gray[200],
    iconInfo: Palette.brand.terracotta,
    iconPositive: Palette.brand.green,
    iconMulticolor: Palette.gray[200],
    iconWarning: Palette.brand.orange,
    iconDanger: Palette.brand.red,
    sidebarBackground: '#ffffffff',
    secondary: Palette.brand.terracotta,
    glassTint: Palette.glassTintLight,
    quickActionIcon: Palette.Lbackground,
    highlight: 'rgba(0, 0, 0, 0.05)',
    backdrop: 'rgba(0, 0, 0, 0.5)',

    // Toggle
    toggleTrackOff: Palette.gray[100],
    toggleTrackOn: Palette.brand.terracotta,
    toggleThumb: Palette.brand.white,
  },

  dark: {
    // Surfaces & text
    background: Palette.brand.black,
    webbackground: Palette.Dbackground,
    surface: Palette.gray[800],
    text: '#ECEDEE',
    textlabel: Palette.Greige,
    muted: Palette.gray[500],
    border: Palette.gray[700],
    divider: Palette.gray[700],
    lightdivider: Palette.gray[750],
    inputPlaceholder: Palette.placeholderGray,

    // Brand & accents
    primary: Palette.Greige,
    primaryForeground: Palette.gray[900],
    accentBlue: Palette.brand.blue,
    accentLightBlue: Palette.brand.lightBlue,
    accentGreen: Palette.brand.green,
    accentYellow: Palette.brand.yellow,
    accentOrange: Palette.brand.orange,
    accentTeal: Palette.brand.teal,
    accentIndigo: Palette.brand.indigo,
    destructive: Palette.brand.redDark,
    destructiveForeground: Palette.brand.white,

    // UI
    icon: Palette.brand.white,
    headerAndroid: Palette.brand.white,
    label: Palette.mushroom,
    tint: Palette.brand.blue,
    tabIconSelected: Palette.brand.blue,
    card: Palette.cardDarkGlass,
    input: Palette.gray[800],
    purple: Palette.brand.purple,
    iosLightGray: Palette.gray[700],
    iosPlaceholder: Palette.gray[500],
    overlay: Palette.gray[600],
    iconInfo: Palette.brand.blue,
    iconPositive: Palette.brand.green,
    iconWarning: Palette.brand.orange,
    iconDanger: Palette.brand.red,
    iconMulticolor: Palette.brand.white,
    // sidebarBackground: Palette.Onyx,
    sidebarBackground: '#0e0d0dff',
    secondary: Palette.Greige,
    glassTint: Palette.glassTintDark,
    quickActionIcon: Palette.Dbackground,
    highlight: 'rgba(255, 255, 255, 0.1)',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    toggleTrackOff: Palette.gray[400],
    toggleTrackOn: Palette.brand.green,
    toggleThumb: Palette.brand.white,
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
export type ThemeColorTokenName = Exclude<TokenName, 'version'>;

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
      primary: Palette.brand.terracotta,
      background: _Tokens.light.background,
      card: _Tokens.light.background,
      text: _Tokens.light.text,
      border: _Tokens.light.border,
      notification: Palette.brand.red,
    },
    fonts: NavigationFonts,
  },
  dark: {
    dark: true,
    colors: {
      primary: Palette.brand.blue,
      background: Palette.brand.black,
      card: _Tokens.dark.background,
      text: _Tokens.dark.text,
      border: _Tokens.dark.border,
      notification: Palette.brand.red,
    },
    fonts: NavigationFonts,
  },
} as const;
