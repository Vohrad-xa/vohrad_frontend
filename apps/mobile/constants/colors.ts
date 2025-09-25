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
    red: '#ef4444',
    redDark: '#dc2626',
    purple: '#6a24c4ff',
    teal: '#14B8A6',
    indigo: '#4F46E5',
    pink: '#EC4899',
  },
  white: '#FFFFFF',
  black: '#000000',
  darkBackground: '#262624',
  creme: '#FAF9F5',
  sidebar: '#1F1E1D',
  lightSidebar: '#F5F4ED',
  quickActionIcon: '#C6613F',
  quickActionIconDark: '#C2C0B6',
  cardDarkGlass: 'rgba(255, 255, 255, 0.1)',
  cardLightGlass: 'rgba(97, 94, 94, 0.16)',
  cardBorderLight: 'rgba(209, 205, 205, 0.3)',
  glassTintLight: 'rgba(255, 255, 255, 0.79)',
  glassTintDark: 'rgba(186, 185, 185, 0.06)',
} as const;

export const Tokens = {
  light: {
    // Surfaces & text
    background: Palette.creme,
    surface: Palette.gray[50],
    text: '#11181C',
    muted: '#6C6C70',
    border: Palette.cardBorderLight,
    divider: Palette.gray[300],

    // Brand & accents
    primary: Palette.brand.blue,
    primaryForeground: Palette.white,
    accent: Palette.brand.blue,
    accentBlue: Palette.brand.blue,
    accentGreen: Palette.brand.green,
    accentYellow: Palette.brand.yellow,
    accentOrange: Palette.brand.orange,
    accentTeal: Palette.brand.teal,
    accentIndigo: Palette.brand.indigo,
    accentPink: Palette.brand.pink,
    destructive: Palette.brand.red,
    destructiveForeground: Palette.white,

    // UI
    icon: Palette.black,
    tint: Palette.brand.blue,
    tabIconDefault: Palette.black,
    tabIconSelected: Palette.brand.blue,
    card: Palette.cardLightGlass,
    input: Palette.white,
    ring: Palette.brand.blue,
    purple: Palette.brand.purple,
    iosLightGray: Palette.gray[50],
    iosPlaceholder: Palette.gray[400],
    overlay: Palette.gray[200],
    iconInfo: Palette.brand.blue,
    iconPositive: Palette.brand.green,
    iconCaution: Palette.brand.yellow,
    iconWarning: Palette.brand.orange,
    iconDanger: Palette.brand.red,
    sidebarBackground: Palette.lightSidebar,
    quickActionIconBackground: Palette.quickActionIcon,
    quickActionIcon: Palette.creme,
    glassTint: Palette.glassTintLight,
  },

  dark: {
    // Surfaces & text
    background: Palette.darkBackground,
    surface: Palette.gray[800],
    text: '#ECEDEE',
    muted: '#A1A1AA',
    border: '#262626',
    divider: Palette.gray[600],

    // Brand & accents
    primary: Palette.brand.blueDark,
    primaryForeground: Palette.gray[900],
    accent: Palette.brand.blueDark,
    accentBlue: Palette.brand.blueDark,
    accentGreen: Palette.brand.green,
    accentYellow: Palette.brand.yellow,
    accentOrange: Palette.brand.orange,
    accentTeal: Palette.brand.teal,
    accentIndigo: Palette.brand.indigo,
    accentPink: Palette.brand.pink,
    destructive: Palette.brand.redDark,
    destructiveForeground: Palette.white,

    // UI
    icon: Palette.creme,
    tint: Palette.brand.blueDark,
    tabIconDefault: '#A1A1AA',
    tabIconSelected: Palette.brand.blueDark,
    card: Palette.cardDarkGlass,
    input: '#111214',
    ring: Palette.brand.blueDark,
    purple: Palette.brand.purple,
    iosLightGray: Palette.gray[700],
    iosPlaceholder: Palette.gray[500],
    overlay: Palette.gray[600],
    iconInfo: Palette.brand.blueDark,
    iconPositive: Palette.brand.green,
    iconCaution: Palette.brand.yellow,
    iconWarning: Palette.brand.orange,
    iconDanger: Palette.brand.red,
    sidebarBackground: Palette.sidebar,
    quickActionIconBackground: Palette.quickActionIconDark,
    quickActionIcon: Palette.black,
    glassTint: Palette.glassTintDark,
  },
} as const;

export type ColorScheme = keyof typeof Tokens; // 'light' | 'dark'
export type ThemePreference = ColorScheme | 'system'; // 'light' | 'dark' | 'system'
export type TokenName = keyof typeof Tokens.light;

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
      primary: Tokens.light.tint,
      background: Tokens.light.background,
      card: Palette.white,
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
