import {Platform, PixelRatio} from 'react-native';
import {generateVersion} from '../utils/versioning';

/**
 * Professional Dynamic Design System
 * Base: 375px width (iPhone 13/14 standard)
 * Fully reactive to screen dimensions and accessibility settings
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const BASE_WIDTH = 390;

const PLATFORM_MULTIPLIER: Record<string, number> = {
  ios: 1.0,
  android: 0.98,
  web: 0.95,
  macos: 1.0,
  windows: 1.0,
};

// ============================================================================
// SCALING UTILITIES
// ============================================================================

const calculateScale = (width: number, fontScale: number): number => {
  const baseScale = width / BASE_WIDTH;
  const clampedScale = Math.max(0.85, Math.min(baseScale, 1.3));
  const platformAdjustment = PLATFORM_MULTIPLIER[Platform.OS] || 1.0;

  // Moderate typography scaling - scales less aggressively than layout
  // Formula: 1 + (scale - 1) * 0.5 means typography scales at 50% rate
  const moderatedScale = 1 + (clampedScale - 1) * 0.5;

  return moderatedScale * platformAdjustment * fontScale;
};

const scaleFont = (size: number, scale: number): number => {
  return Math.round(size * scale);
};

/**
 * Platform-specific typography specifications
 * iOS: Human Interface Guidelines
 * Android: Material Design 3
 * Web: Follows iOS for consistency
 */
interface TypographySpec {
  fontSize: number;
  lineHeight: number;
  fontWeight: '400' | '500' | '600' | '700';
  letterSpacing: number;
}

const createPlatformTypography = (
  iosSpec: TypographySpec,
  androidSpec: TypographySpec,
  scale: number,
): TypographySpec => {
  const spec = Platform.select({
    ios: iosSpec,
    android: androidSpec,
    default: iosSpec, // Web uses iOS
  })!;

  return {
    fontSize: scaleFont(spec.fontSize, scale),
    lineHeight: Math.round(scaleFont(spec.fontSize, scale) * spec.lineHeight),
    fontWeight: spec.fontWeight,
    letterSpacing: spec.letterSpacing,
  };
};

// ============================================================================
// DESIGN SYSTEM FACTORY
// ============================================================================

/**
 * Creates a design system instance with responsive scaling
 * Call with current dimensions for dynamic updates
 */
export const createDesignSystem = (
  screenWidth: number,
  screenHeight: number,
  fontScale: number = 1.0,
) => {
  const scale = calculateScale(screenWidth, fontScale);

  const system = {
    fonts: {
      system: 'System',
      brand: 'System',
      brandMedium: 'System',
    },

    typography: {
      // Page Level - Headers
      pageTitle: {
        fontSize: scaleFont(34, scale),
        lineHeight: Math.round(scaleFont(34, scale) * 1.21),
        fontWeight: '700' as const,
        letterSpacing: 0.37,
      },

      sectionTitle: {
        fontSize: scaleFont(22, scale),
        lineHeight: Math.round(scaleFont(22, scale) * 1.27),
        fontWeight: '600' as const,
        letterSpacing: 0.35,
      },

      heading: {
        fontSize: scaleFont(17, scale),
        lineHeight: Math.round(scaleFont(17, scale) * 1.29),
        fontWeight: '600' as const,
        letterSpacing: -0.41,
      },

      // Content Level - Text (Platform-aware)
      label: createPlatformTypography(
        {
          fontSize: 17,
          lineHeight: 1.294,
          fontWeight: '400',
          letterSpacing: -0.43,
        }, // iOS Body
        {fontSize: 16, lineHeight: 1.5, fontWeight: '400', letterSpacing: 0}, // Android Body Large
        scale,
      ),

      body: createPlatformTypography(
        {
          fontSize: 17,
          lineHeight: 1.294,
          fontWeight: '400',
          letterSpacing: -0.43,
        }, // iOS Body
        {fontSize: 16, lineHeight: 1.5, fontWeight: '400', letterSpacing: 0}, // Android Body Large
        scale,
      ),

      secondary: createPlatformTypography(
        {
          fontSize: 15,
          lineHeight: 1.33,
          fontWeight: '400',
          letterSpacing: -0.24,
        }, // iOS Subheadline
        {fontSize: 14, lineHeight: 1.43, fontWeight: '400', letterSpacing: 0}, // Android Body Medium
        scale,
      ),

      value: createPlatformTypography(
        {
          fontSize: 17,
          lineHeight: 1.294,
          fontWeight: '400',
          letterSpacing: -0.43,
        }, // iOS Body (same as label)
        {fontSize: 14, lineHeight: 1.43, fontWeight: '500', letterSpacing: 0}, // Android Label Large
        scale,
      ),

      // Utility - Small Text
      footnote: {
        fontSize: scaleFont(13, scale),
        lineHeight: Math.round(scaleFont(13, scale) * 1.38),
        fontWeight: '400' as const,
        letterSpacing: -0.08,
      },

      caption: {
        fontSize: scaleFont(12, scale),
        lineHeight: Math.round(scaleFont(12, scale) * 1.33),
        fontWeight: '400' as const,
        letterSpacing: 0,
      },
    },

    fontWeight: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },

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

    borderRadius: {
      none: 0,
      xs: 2,
      sm: 4,
      md: 6,
      lg: 8,
      xl: 10,
      xxl: 14,
      xxxl: 24,
      full: 9999,
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
        borderRadius: 15,
        padding: 12,
        height: 44,
        borderWidth: 1,
        fontSize: 17,
      },

      button: {
        borderRadius: 15,
        paddingVertical: 12,
        paddingHorizontal: 16,
        height: 44,
        fontSize: 17,
      },

      card: {
        borderRadius: 30,
        padding: 16,
      },

      modal: {
        borderRadius: 10,
        padding: 24,
      },

      listItem: {
        minHeight: 44,
        paddingVertical: 10,
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
        borderRadius: 10,
        paddingHorizontal: 12,
      },

      tabBar: {
        height: 50,
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

  return {
    ...system,
    version: generateVersion(system),
  } as const;
};

// ============================================================================
// DEFAULT EXPORT (Lazy Initialized)
// ============================================================================

let _cachedDesignSystem: ReturnType<typeof createDesignSystem> | null = null;
let _cachedDimensions = {width: 0, height: 0, fontScale: 0};

/**
 * Get design system instance
 * Automatically updates when dimensions or font scale changes
 */
export const getDesignSystem = () => {
  const Dimensions = require('react-native').Dimensions;
  const {width, height} = Dimensions.get('window');
  const fontScale = PixelRatio.getFontScale();

  // Recalculate if dimensions or font scale changed
  if (
    !_cachedDesignSystem ||
    _cachedDimensions.width !== width ||
    _cachedDimensions.height !== height ||
    _cachedDimensions.fontScale !== fontScale
  ) {
    _cachedDesignSystem = createDesignSystem(width, height, fontScale);
    _cachedDimensions = {width, height, fontScale};
  }

  return _cachedDesignSystem;
};

/**
 * Default export for convenience
 * Use getDesignSystem() or createDesignSystem() for reactive behavior
 */
export const DesignSystem = getDesignSystem();

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type DesignSystemType = ReturnType<typeof createDesignSystem>;
export type Typography = keyof DesignSystemType['typography'];
export type FontFamily = keyof DesignSystemType['fonts'];
export type FontWeight = keyof DesignSystemType['fontWeight'];
export type Spacing = keyof DesignSystemType['spacing'];
export type BorderRadius = keyof DesignSystemType['borderRadius'];
export type Opacity = keyof DesignSystemType['opacity'];
