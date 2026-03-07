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

  blue: '#007AFF',
  deepblue: '#2e64cf',
  lightBlue: '#d5e7f9',
  bluepurple: '#135489',
  slateblue: '#264653',
  teal: '#14B8A6',
  indigo: '#4F46E5',
  purple: '#6a24c4ff',
  green: '#36ba06ff',
  orange: '#ffaa00',
  red: '#f00909ff',

  white: '#FFFFFE',
  offWhite: '#f0f0ef',
  fog: '#F2F2F6',
  cloud: '#ECEDEE',
  Greige: '#C2C0B6',
  mushroom: '#9C9A92',
  iceA83: '#dfeff3f2',
  whiteA10: 'rgba(255, 255, 255, 0.1)',

  black: '#000000',
  blackA10: 'rgba(0,0,0,0.10)',
  slate: '#11181C',
  obsidian: '#0a0a0bff',
  midnight: '#121315ff',
  steelA65: '#89afc343',
  graphite: '#262624',
  charcoalA45: 'rgba(79, 77, 77, 0.45)',
  graphiteA16: 'rgba(97, 94, 94, 0.16)',
} as const;

const _Tokens = {
  light: {
    primary: Palette.lightBlue,
    secondary: Palette.lightBlue,
    tertiary: Palette.bluepurple,
    tint: Palette.blue,
    tint2: Palette.bluepurple,
    muted: Palette.gray[500],

    background: Palette.white,
    modalBackground: Palette.fog,
    card: Palette.white,
    text: Palette.slate,
    icon: Palette.gray[600],
    tabBar: Palette.white,
    tabIndicator: Palette.lightBlue,
    ripple: Palette.blackA10,

    quickActionIcon: Palette.gray[700],
    selected: Palette.gray[300],
    border: Palette.gray[200],
    divider: Palette.gray[300],
    inputPlaceholder: Palette.gray[400],
    headerAndroid: Palette.bluepurple,
    secondaryContainer: Palette.lightBlue,

    accentBlue: Palette.blue,
    accentGreen: Palette.green,
    accentOrange: Palette.orange,
    accentRed: Palette.red,
    accentPurple: Palette.purple,
    accentTeal: Palette.teal,
    accentIndigo: Palette.indigo,
    white: Palette.white,
    offWhite: Palette.fog,
  },

  dark: {
    primary: Palette.lightBlue,
    secondary: Palette.Greige,
    tertiary: Palette.slateblue,
    tint: Palette.blue,
    tint2: Palette.iceA83,
    muted: Palette.gray[500],

    background: Palette.black,
    modalBackground: Palette.gray[900],
    card: Palette.midnight,
    text: Palette.white,
    icon: Palette.gray[200],
    tabBar: Palette.midnight,
    tabIndicator: Palette.steelA65,
    ripple: Palette.charcoalA45,

    quickActionIcon: Palette.graphite,
    inputPlaceholder: Palette.gray[600],
    border: Palette.gray[700],
    divider: Palette.gray[700],
    headerAndroid: Palette.white,
    selected: Palette.gray[750],
    secondaryContainer: Palette.slateblue,

    accentBlue: Palette.blue,
    accentGreen: Palette.green,
    accentOrange: Palette.orange,
    accentRed: Palette.red,
    accentPurple: Palette.purple,
    accentTeal: Palette.teal,
    accentIndigo: Palette.indigo,
    white: Palette.white,
    offWhite: Palette.white,
  },
} as const;

export const Tokens = {
  light: {..._Tokens.light, version: generateVersion(_Tokens.light)},
  dark: {..._Tokens.dark, version: generateVersion(_Tokens.dark)},
} as const;

export type ColorScheme = keyof typeof _Tokens;
export type ThemePreference = ColorScheme | 'system';
export type TokenName = keyof typeof _Tokens.light;
export type ThemeColorTokenName = Exclude<TokenName, 'version'>;

const NavigationFonts = {
  regular: {fontFamily: 'System', fontWeight: '400' as const},
  medium: {fontFamily: 'System', fontWeight: '500' as const},
  bold: {fontFamily: 'System', fontWeight: '600' as const},
  heavy: {fontFamily: 'System', fontWeight: '700' as const},
} as const;

export const NavigationThemes = {
  light: {
    dark: false,
    colors: {
      primary: Tokens.light.secondary,
      background: Palette.fog,
      card: '#F0F3F8',
      text: Tokens.light.text,
      border: Tokens.light.border,
      notification: Palette.red,
    },
    fonts: NavigationFonts,
  },
  dark: {
    dark: true,
    colors: {
      primary: Palette.blue,
      background: Tokens.dark.background,
      card: Tokens.dark.background,
      text: Tokens.dark.text,
      border: Tokens.dark.border,
      notification: Palette.red,
    },
    fonts: NavigationFonts,
  },
} as const;
