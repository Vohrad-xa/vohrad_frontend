import {Dimensions} from 'react-native';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

const borderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 10,
  xxl: 14,
  xxxl: 24,
  full: 9999,
} as const;

export const DesignSystem = {
  // Border radius system
  borderRadius,

  // Spacing scale
  spacing: {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 32,
    xxxl: 48,
  },

  fonts: {
    system: 'System',
    brand: 'System',
    brandMedium: 'System',
  },

  typography: {
    pageTitle: {
      fontSize: 34,
      lineHeight: 41,
      fontWeight: '700' as const,
      letterSpacing: 0.4,
    },

    pageTitleScrolled: {
      fontSize: 17,
      lineHeight: 22,
      fontWeight: '500' as const,
      letterSpacing: -0.43,
    },

    body: {
      fontSize: 17,
      lineHeight: 22,
      fontWeight: '400' as const,
      letterSpacing: -0.43,
    },

    secondary: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: '400' as const,
      letterSpacing: -0.24,
    },

    tertiary: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '400' as const,
      letterSpacing: 0,
    },

    caption: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '400' as const,
      letterSpacing: 0,
    },

    actionBar: {
      fontSize: 10,
      lineHeight: 12,
      fontWeight: '400' as const,
      letterSpacing: 0.12,
    },

    interactive: {
      fontSize: 17,
      lineHeight: 22,
      fontWeight: '400' as const,
      letterSpacing: -0.43,
    },

    largeTitle: {
      fontSize: 34,
      lineHeight: 41,
      fontWeight: '700' as const,
      letterSpacing: 0.4,
    },

    title1: {
      fontSize: 28,
      lineHeight: 34,
      fontWeight: '400' as const,
      letterSpacing: 0.36,
    },

    title2: {
      fontSize: 22,
      lineHeight: 28,
      fontWeight: '600' as const,
      letterSpacing: 0.35,
    },

    title3: {
      fontSize: 20,
      lineHeight: 24,
      fontWeight: '400' as const,
      letterSpacing: 0.38,
    },

    headline: {
      fontSize: 17,
      lineHeight: 22,
      fontWeight: '600' as const,
      letterSpacing: -0.43,
    },

    callout: {
      fontSize: 16,
      lineHeight: 20,
      fontWeight: '600' as const,
      letterSpacing: -0.32,
    },

    subheadline: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: '400' as const,
      letterSpacing: -0.24,
    },

    footnote: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '400' as const,
      letterSpacing: -0.08,
    },

    caption1: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '400' as const,
      letterSpacing: 0,
    },

    caption2: {
      fontSize: 11,
      lineHeight: 13,
      fontWeight: '400' as const,
      letterSpacing: 0.07,
    },

    tabBar: {
      fontSize: 10,
      lineHeight: 12,
      fontWeight: '400' as const,
      letterSpacing: 0.12,
    },
  },

  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
  },

  components: {
    navBar: {
      statusBarHeight: 59,
      firstRowHeight: 44,
      secondRowHeight: 58,
      thirdRowHeight: 48,
      totalCompactHeight: 44,
      totalLargeHeight: 102,
    },

    input: {
      borderRadius: borderRadius.xl,
      padding: 12,
      height: 44,
      borderWidth: 1,
      fontSize: 17,
    },

    button: {
      borderRadius: borderRadius.xl,
      paddingVertical: 12,
      paddingHorizontal: 16,
      height: 44,
      fontSize: 17,
    },

    card: {
      borderRadius: borderRadius.xxxl,
      padding: 16,
    },

    modal: {
      borderRadius: borderRadius.xl,
      padding: 24,
    },

    listItem: {
      minHeight: 44,
      paddingVertical: 11,
      paddingHorizontal: 16,
    },

    listItemLarge: {
      minHeight: 60,
      paddingVertical: 12,
      paddingHorizontal: 16,
    },

    separator: {
      height: 0.5,
      marginLeft: 16,
    },

    tapTarget: {
      minSize: 44,
    },

    searchBar: {
      height: 36,
      borderRadius: borderRadius.xl,
      paddingHorizontal: 12,
    },

    tabBar: {
      height: 49,
      paddingBottom: 0,
    },
  },

  iconSize: {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28,
    xxl: 32,
  },

  layout: {
    headerHeight: 44,
    headerHeightLarge: 102,
    tabBarHeight: 49,
    sidebarWidth: 280,
    maxContentWidth: 1200,
    screenPadding: 16,
    listItemSpacing: 0,
    sectionSpacing: 35,
  },

  animation: {
    fast: 150,
    normal: 300,
    slow: 500,
  },

  opacity: {
    disabled: 0.3,
    pressed: 0.5,
    muted: 0.6,
    overlay: 0.8,
    full: 1.0,
  },

  screen: {
    width: screenWidth,
    height: screenHeight,
  },
} as const;

// Type exports
export type BorderRadius = keyof typeof DesignSystem.borderRadius;
export type Spacing = keyof typeof DesignSystem.spacing;
export type Typography = keyof typeof DesignSystem.typography;
export type FontFamily = keyof typeof DesignSystem.fonts;
export type FontWeight = keyof typeof DesignSystem.fontWeight;
export type Opacity = keyof typeof DesignSystem.opacity;
