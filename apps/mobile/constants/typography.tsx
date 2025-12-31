import {Platform, PixelRatio} from 'react-native';
import {generateVersion} from '../utils/versioning';

/**
 * Dynamic Design System
 * Base: 390px width (iPhone 13/14 standard)
 * Fully reactive to screen dimensions and accessibility settings
 */

// CONFIGURATION
const BASE_WIDTH = 390;

const PLATFORM_MULTIPLIER: Record<string, number> = {
  ios: 1.0,
  android: 0.98,
  web: 0.95,
  macos: 1.0,
  windows: 1.0,
};

// SCALING UTILITIES
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
 * iOS: Dynamic Type defaults
 * Android: Material Design 3 type scale defaults
 */
interface TypographySpec {
  fontSize: number;
  lineHeight: number; // multiplier
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

  const scaledFontSize = scaleFont(spec.fontSize, scale);

  return {
    fontSize: scaledFontSize,
    lineHeight: Math.round(scaledFontSize * spec.lineHeight),
    fontWeight: spec.fontWeight,
    letterSpacing: spec.letterSpacing,
  };
};

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
      // LARGE TITLES & HEADLINES

      // iOS: .largeTitle (34, regular) / Android: headlineLarge (32/40)
      pageTitle: createPlatformTypography(
        {
          fontSize: 34,
          lineHeight: 41 / 34,
          fontWeight: '400',
          letterSpacing: 0.37,
        },
        {
          fontSize: 32,
          lineHeight: 40 / 32,
          fontWeight: '400',
          letterSpacing: 0,
        },
        scale,
      ),

      // iOS: .title1 (28) / Android: headlineMedium (28/36)
      title1: createPlatformTypography(
        {
          fontSize: 28,
          lineHeight: 34 / 28,
          fontWeight: '400',
          letterSpacing: 0.36,
        },
        {
          fontSize: 28,
          lineHeight: 36 / 28,
          fontWeight: '400',
          letterSpacing: 0,
        },
        scale,
      ),

      // iOS: .title2 (22) / Android: titleLarge (22/28, Medium)
      sectionTitle: createPlatformTypography(
        {
          fontSize: 22,
          lineHeight: 28 / 22,
          fontWeight: '400',
          letterSpacing: 0.35,
        },
        {
          fontSize: 22,
          lineHeight: 28 / 22,
          fontWeight: '500',
          letterSpacing: 0,
        },
        scale,
      ),

      // iOS: .title3 (20) / Android: headlineSmall (24/32)
      title3: createPlatformTypography(
        {
          fontSize: 20,
          lineHeight: 25 / 20,
          fontWeight: '400',
          letterSpacing: 0.38,
        },
        {
          fontSize: 24,
          lineHeight: 32 / 24,
          fontWeight: '400',
          letterSpacing: 0,
        },
        scale,
      ),

      // CONTENT TEXT

      // iOS: .headline (17, semibold) / Android: titleMedium (16/24, Medium)
      heading: createPlatformTypography(
        {
          fontSize: 17,
          lineHeight: 22 / 17,
          fontWeight: '600',
          letterSpacing: -0.41,
        },
        {
          fontSize: 16,
          lineHeight: 24 / 16,
          fontWeight: '500',
          letterSpacing: 0.15, // common M3 titleMedium value
        },
        scale,
      ),

      // iOS: .body (17) / Android: bodyLarge (16/24)
      body: createPlatformTypography(
        {
          fontSize: 17,
          lineHeight: 22 / 17,
          fontWeight: '400',
          letterSpacing: -0.41,
        },
        {
          fontSize: 16,
          lineHeight: 24 / 16,
          fontWeight: '400',
          letterSpacing: 0,
        },
        scale,
      ),

      // Settings left: iOS usually body; Android keep bodyLarge
      label: createPlatformTypography(
        {
          fontSize: 17,
          lineHeight: 22 / 17,
          fontWeight: '400',
          letterSpacing: 0,
        },
        {
          fontSize: 19,
          lineHeight: 24 / 19,
          fontWeight: '400',
          letterSpacing: -0.21,
        },
        scale,
      ),

      // Settings right: iOS usually body; Android often labelLarge (14/20, Medium)
      value: createPlatformTypography(
        {
          fontSize: 17,
          lineHeight: 22 / 17,
          fontWeight: '400',
          letterSpacing: -0.41,
        },
        {
          fontSize: 14,
          lineHeight: 20 / 14,
          fontWeight: '500',
          letterSpacing: 0,
        },
        scale,
      ),

      // iOS: .callout (16) / Android: bodyLarge (16/24)
      callout: createPlatformTypography(
        {
          fontSize: 16,
          lineHeight: 21 / 16,
          fontWeight: '400',
          letterSpacing: -0.32,
        },
        {
          fontSize: 16,
          lineHeight: 24 / 16,
          fontWeight: '400',
          letterSpacing: 0,
        },
        scale,
      ),

      // iOS: .subheadline (15) / Android: bodyMedium (14/20)
      secondary: createPlatformTypography(
        {
          fontSize: 15,
          lineHeight: 20 / 15,
          fontWeight: '400',
          letterSpacing: -0.24,
        },
        {
          fontSize: 14,
          lineHeight: 20 / 14,
          fontWeight: '400',
          letterSpacing: 0,
        },
        scale,
      ),

      // SMALL TEXT

      // iOS: .footnote (13) / Android: bodySmall (12/16)
      footnote: createPlatformTypography(
        {
          fontSize: 13,
          lineHeight: 18 / 13,
          fontWeight: '400',
          letterSpacing: -0.08,
        },
        {
          fontSize: 12,
          lineHeight: 16 / 12,
          fontWeight: '400',
          letterSpacing: 0,
        },
        scale,
      ),

      // iOS: .caption1 (12) / Android: labelMedium (12/16, Medium)
      caption: createPlatformTypography(
        {
          fontSize: 12,
          lineHeight: 16 / 12,
          fontWeight: '400',
          letterSpacing: 0,
        },
        {
          fontSize: 12,
          lineHeight: 16 / 12,
          fontWeight: '500',
          letterSpacing: 0,
        },
        scale,
      ),

      // iOS: .caption2 (11) / Android: labelSmall (11/16, Medium)
      caption2: createPlatformTypography(
        {
          fontSize: 11,
          lineHeight: 13 / 11,
          fontWeight: '400',
          letterSpacing: 0.07,
        },
        {
          fontSize: 11,
          lineHeight: 16 / 11,
          fontWeight: '500',
          letterSpacing: 0,
        },
        scale,
      ),
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
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
      },
      md: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
      lg: {
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
      },
    },

    components: {
      // navBar: {
      //   statusBarHeight: 59,
      //   firstRowHeight: 44,
      //   secondRowHeight: 58,
      //   thirdRowHeight: 48,
      //   totalCompactHeight: 44,
      //   totalLargeHeight: 102,
      // },

      input: {
        borderRadius: 20,
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
        borderRadius: 25,
        padding: 24,
      },

      listItem: {
        minHeight: 44,
        paddingVertical: 10,
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
        height: Platform.OS === 'android' ? 100 : undefined,
        paddingBottom: 0,
      },
    },

    iconSize: {
      xs: 12,
      sm: 16,
      md: 20,
      lg: 24,
      xl: 28,
      xxl: 36,
    },

    layout: {
      headerHeight: 44,
      headerHeightLarge: 102,
      tabBarHeight: 80,
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

// DEFAULT EXPORT (Lazy Initialized)

let _cachedDesignSystem: ReturnType<typeof createDesignSystem> | null = null;
let _cachedDimensions = {width: 0, height: 0, fontScale: 0};

/**
 * Get design system instance
 * Automatically updates when dimensions or font scale changes
 */
export const getDesignSystem = () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Dimensions = require('react-native').Dimensions;
  const {width, height} = Dimensions.get('window');
  const fontScale = PixelRatio.getFontScale();

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

export const DesignSystem = getDesignSystem();

export type DesignSystemType = ReturnType<typeof createDesignSystem>;
export type Typography = keyof DesignSystemType['typography'];
export type FontFamily = keyof DesignSystemType['fonts'];
export type FontWeight = keyof DesignSystemType['fontWeight'];
export type Spacing = keyof DesignSystemType['spacing'];
export type BorderRadius = keyof DesignSystemType['borderRadius'];
export type Opacity = keyof DesignSystemType['opacity'];
