import {generateVersion} from '../utils/versioning';

export const Palette = {
  gray: {
    50: '#F2F2F2',
    100: '#E5E5EA',
    200: '#D1D1D6',
    300: '#C7C7CC',
    400: '#A1A1AA',
    500: '#8E8E93',
    600: '#535355ff',
    700: '#48484A',
    750: '#3A3A3C',
    800: '#30302E',
    850: '#2C2C2E',
    900: '#1C1C1E',
    950: '#0B0B0B',
  },
  blue: '#0A84FF',
  deepblue: '#1251D3',
  lightBlue: '#DDE7FB',
  indigo: '#4F46E5',
  green: '#36ba06ff',
  orange: '#FF9500',
  red: '#ef4444',
  redDark: '#dc2626',
  purple: '#6a24c4ff',
  bluepurple: '#10385bff',
  teal: '#14B8A6',
  white: '#FFFFFE',
  Greige: '#C2C0B6',
  black: '#000000',
  webDarkBackground: '#262624',
  webLightBackground: '#FAF9F5',
  modalground: '#F2F2F6',
  mushroom: '#9C9A92',
  cardDark: 'rgba(255, 255, 255, 0.1)',
  cardLight: 'rgba(97, 94, 94, 0.16)',
  glassTintLight: 'rgba(20, 20, 20, 0.27)',
  glassTintDark: 'rgba(186, 185, 185, 0.72)',
} as const;

const _Tokens = {
  light: {
    // Base
    primary: Palette.deepblue,
    secondary: Palette.lightBlue,
    background: Palette.white,
    modalBackground: Palette.modalground,
    webbackground: Palette.webLightBackground,
    sidebarBackground: Palette.modalground,
    backdrop: 'rgba(0, 0, 0, 0.5)',
    text: '#11181C',

    // Accents
    accentBlue: Palette.blue,
    accentDeepblue: Palette.deepblue,
    accentGreen: Palette.green,
    accentOrange: Palette.orange,
    accentIndigo: Palette.indigo,
    accentPurple: Palette.purple,
    white: Palette.white,
    destructive: Palette.red,
    muted: Palette.gray[600],
    ripple: 'rgba(31, 0, 0, 0.16)',
    selected: Palette.gray[300],

    // Icons
    icon: Palette.gray[600],
    docIcon: Palette.gray[200],
    quickActionIcon: Palette.gray[700],

    // Components
    surface: Palette.gray[50],
    border: Palette.gray[200],
    divider: Palette.gray[300],
    inputPlaceholder: Palette.gray[400],
    glassTint: Palette.glassTintLight,
    card: Palette.cardLight,
    headerAndroid: Palette.bluepurple,
    input: Palette.white,
  },

  dark: {
    // Base
    primary: Palette.Greige,
    secondary: Palette.Greige,
    background: Palette.black,
    modalBackground: Palette.gray[900],
    webbackground: Palette.Greige,
    sidebarBackground: '#0e0d0dff',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    text: '#ECEDEE',

    // Accents
    accentBlue: Palette.blue,
    accentDeepblue: Palette.deepblue,
    accentGreen: Palette.green,
    accentOrange: Palette.orange,
    accentIndigo: Palette.indigo,
    accentPurple: Palette.purple,
    white: Palette.white,
    destructive: Palette.redDark,
    muted: Palette.gray[500],
    ripple: 'rgba(79, 77, 77, 0.45)',
    selected: Palette.gray[750],

    // Icons
    icon: Palette.gray[200],
    docIcon: Palette.white,
    quickActionIcon: Palette.webDarkBackground,

    // Components
    inputPlaceholder: Palette.gray[600],
    border: Palette.gray[700],
    input: Palette.gray[800],
    divider: Palette.gray[700],
    surface: Palette.gray[800],
    glassTint: Palette.glassTintDark,
    card: Palette.cardDark,
    headerAndroid: Palette.white,
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

// React Navigation compatible themes
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
      primary: Palette.lightBlue,
      background: _Tokens.light.background,
      card: _Tokens.light.background,
      text: _Tokens.light.text,
      border: _Tokens.light.border,
      notification: Palette.red,
    },
    fonts: NavigationFonts,
  },
  dark: {
    dark: true,
    colors: {
      primary: Palette.blue,
      background: Palette.black,
      card: _Tokens.dark.background,
      text: _Tokens.dark.text,
      border: _Tokens.dark.border,
      notification: Palette.red,
    },
    fonts: NavigationFonts,
  },
} as const;
