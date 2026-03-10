import {Platform, type TextProps, type TextStyle} from 'react-native';
import {generateVersion} from '../utils/versioning';
import {type MD3TypescaleKey, useTheme} from 'react-native-paper';

type DynamicTypeRamp = NonNullable<TextProps['dynamicTypeRamp']>;
type PaperFont = `${MD3TypescaleKey}`;

type TypographyEntry = {
  readonly ios: {
    readonly dynamicTypeRamp: DynamicTypeRamp;
    readonly fontSize: number;
  };
  readonly paper: {
    readonly variant: PaperFont;
  };
};

const TYPOGRAPHY = {
  largeTitle: {
    ios: {dynamicTypeRamp: 'largeTitle', fontSize: 34},
    paper: {variant: 'headlineMedium'},
  },
  title1: {
    ios: {dynamicTypeRamp: 'title1', fontSize: 28},
    paper: {variant: 'titleLarge'},
  },
  title2: {
    ios: {dynamicTypeRamp: 'title2', fontSize: 22},
    paper: {variant: 'titleMedium'},
  },
  title3: {
    ios: {dynamicTypeRamp: 'title3', fontSize: 20},
    paper: {variant: 'titleSmall'},
  },
  headline: {
    ios: {dynamicTypeRamp: 'headline', fontSize: 17},
    paper: {variant: 'headlineSmall'},
  },
  body: {
    ios: {dynamicTypeRamp: 'body', fontSize: 17},
    paper: {variant: 'bodyLarge'},
  },
  label: {
    ios: {dynamicTypeRamp: 'body', fontSize: 17},
    paper: {variant: 'labelLarge'},
  },
  value: {
    ios: {dynamicTypeRamp: 'body', fontSize: 17},
    paper: {variant: 'labelMedium'},
  },
  callout: {
    ios: {dynamicTypeRamp: 'callout', fontSize: 16},
    paper: {variant: 'bodySmall'},
  },
  subheadline: {
    ios: {dynamicTypeRamp: 'subheadline', fontSize: 15},
    paper: {variant: 'bodyMedium'},
  },
  footnote: {
    ios: {dynamicTypeRamp: 'footnote', fontSize: 13},
    paper: {variant: 'bodySmall'},
  },
  caption: {
    ios: {dynamicTypeRamp: 'caption1', fontSize: 12},
    paper: {variant: 'labelSmall'},
  },
  caption2: {
    ios: {dynamicTypeRamp: 'caption2', fontSize: 11},
    paper: {variant: 'labelSmall'},
  },
} as const satisfies Record<string, TypographyEntry>;

export type Typography = keyof typeof TYPOGRAPHY;

const TYPOGRAPHY_KEYS = Object.keys(TYPOGRAPHY) as Typography[];

export function useTypography(): Record<Typography, TextStyle> {
  const {fonts} = useTheme();

  const result = {} as Record<Typography, TextStyle>;
  for (const key of TYPOGRAPHY_KEYS) {
    const entry = TYPOGRAPHY[key];
    result[key] =
      Platform.OS === 'ios'
        ? {fontSize: entry.ios.fontSize}
        : fonts[entry.paper.variant];
  }
  return result;
}

export function getDynamicTypeRamp(variant: Typography): DynamicTypeRamp {
  return TYPOGRAPHY[variant].ios.dynamicTypeRamp;
}

export const createDesignSystem = (
  screenWidth: number,
  screenHeight: number,
  fontScale: number = 1.0,
) => {
  const system = {
    screen: {width: screenWidth, height: screenHeight, fontScale},

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
      listItem: {minHeight: 44, paddingVertical: 10, paddingHorizontal: 16},
      separator: {height: 0.5, marginLeft: 16},
      tapTarget: {minSize: 44},
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
      tabBarHeight: 80,
      screenPadding: 16,
      sectionSpacing: 35,
    } as const,

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
