import {Platform, type TextProps} from 'react-native';
import {generateVersion} from '../utils/versioning';
import type {MD3TypescaleKey} from 'react-native-paper';

type PaperVariant = `${MD3TypescaleKey}`;

export type Typography =
  | 'largeTitle'
  | 'title1'
  | 'title2'
  | 'title3'
  | 'headline'
  | 'body'
  | 'label'
  | 'value'
  | 'callout'
  | 'subheadline'
  | 'footnote'
  | 'caption'
  | 'caption2';

const IOS_TYPOGRAPHY: Record<
  Typography,
  {dynamicTypeRamp: TextProps['dynamicTypeRamp']; baseSize: number}
> = {
  largeTitle: {dynamicTypeRamp: 'largeTitle', baseSize: 34},
  title1: {dynamicTypeRamp: 'title1', baseSize: 28},
  title2: {dynamicTypeRamp: 'title2', baseSize: 22},
  title3: {dynamicTypeRamp: 'title3', baseSize: 20},
  headline: {dynamicTypeRamp: 'headline', baseSize: 17},
  body: {dynamicTypeRamp: 'body', baseSize: 17},
  label: {dynamicTypeRamp: 'body', baseSize: 17},
  value: {dynamicTypeRamp: 'body', baseSize: 17},
  callout: {dynamicTypeRamp: 'callout', baseSize: 16},
  subheadline: {dynamicTypeRamp: 'subheadline', baseSize: 15},
  footnote: {dynamicTypeRamp: 'footnote', baseSize: 13},
  caption: {dynamicTypeRamp: 'caption1', baseSize: 12},
  caption2: {dynamicTypeRamp: 'caption2', baseSize: 11},
};

const PAPER_TYPOGRAPHY: Record<Typography, PaperVariant> = {
  largeTitle: 'headlineMedium',
  title1: 'titleLarge',
  title2: 'titleMedium',
  title3: 'titleSmall',
  headline: 'headlineSmall',
  body: 'bodyLarge',
  subheadline: 'bodySmall',
  label: 'labelLarge',
  value: 'labelMedium',
  callout: 'bodySmall',
  footnote: 'bodySmall',
  caption: 'labelSmall',
  caption2: 'labelSmall',
};

export const createDesignSystem = (
  screenWidth: number,
  screenHeight: number,
  fontScale: number = 1.0,
) => {
  const system = {
    screen: {width: screenWidth, height: screenHeight, fontScale},

    typography: {
      ios: IOS_TYPOGRAPHY,
      paper: PAPER_TYPOGRAPHY,
    },

    fontWeight: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    } as const,

    spacing: {
      xxs: 2,
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 20,
      xxl: 32,
      xxxl: 48,
    } as const,

    borderRadius: {
      none: 0,
      xs: 2,
      sm: 4,
      md: 6,
      lg: 8,
      xl: 10,
      xxl: 14,
      xxxl: 22,
      full: 9999,
    } as const,

    shadows: {
      sm: {
        shadowColor: '#000000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      },
      md: {
        shadowColor: '#000000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
      },
      lg: {
        shadowColor: '#000000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
      },
    } as const,

    components: {
      input: {
        borderRadius: 20,
        padding: 12,
        height: 44,
        borderWidth: 1,
        fontSize: 17,
      },
      button: {
        borderRadius: 50,
        paddingVertical: 12,
        paddingHorizontal: 16,
        height: 48,
        fontSize: 16,
        fontWeight: '500',
      },
      card: {borderRadius: 18, padding: 16},
      modal: {borderRadius: 25, padding: 24},
      listItem: {minHeight: 44, paddingVertical: 10, paddingHorizontal: 16},
      separator: {height: 0.5, marginLeft: 16},
      tapTarget: {minSize: 44},
      searchBar: {height: 36, borderRadius: 10, paddingHorizontal: 12},
      tabBar: {
        height: Platform.OS === 'android' ? 100 : undefined,
        paddingBottom: 0,
      },
    } as const,

    iconSize: {
      xxs: 8,
      xs: 12,
      sm: 16,
      md: 20,
      lg: 24,
      xl: 28,
      xxl: 36,
      xxxl: 46,
    } as const,

    layout: {
      headerHeight: 44,
      headerHeightLarge: 102,
      tabBarHeight: 80,
      sidebarWidth: 280,
      maxContentWidth: 1200,
      screenPadding: 16,
      listItemSpacing: 0,
      sectionSpacing: 35,
    } as const,

    animation: {fast: 150, normal: 300, slow: 500} as const,

    opacity: {
      disabled: 0.3,
      pressed: 0.5,
      muted: 0.6,
      overlay: 0.8,
      full: 1.0,
    } as const,
  } as const;

  return {...system, version: generateVersion(system)} as const;
};

export type DesignSystem = ReturnType<typeof createDesignSystem>;

export type Spacing = keyof DesignSystem['spacing'];
export type BorderRadius = keyof DesignSystem['borderRadius'];
export type Opacity = keyof DesignSystem['opacity'];
export type FontWeight = keyof DesignSystem['fontWeight'];

export type TypographyProps = {
  dynamicTypeRamp?: TextProps['dynamicTypeRamp'];
  variant?: PaperVariant;
  fontSize?: number;
  allowFontScaling?: boolean;
};

export function getTextProps(
  variant: Typography = 'body',
  ds: DesignSystem,
): TypographyProps {
  if (Platform.OS === 'ios') {
    const config = ds.typography.ios[variant];
    return {
      dynamicTypeRamp: config.dynamicTypeRamp,
      fontSize: config.baseSize,
      allowFontScaling: true,
    };
  }

  // Android and other platfroms
  return {
    variant: ds.typography.paper[variant],
    allowFontScaling: true,
  };
}
