import React from 'react';
import {Text, type TextProps} from 'react-native';
import type {TokenName} from '@/constants/colors';
import type {DesignSystem, Typography} from '@/constants/typography';
import {useTheme} from '@/providers/theme-provider';
type ThemeType = ReturnType<typeof useTheme>['theme'];

// Text variants based on typography system
export type TextVariant = Typography;

export type ThemedTextProps = TextProps & {
  variant?: TextVariant;
  color?: string;
  colorToken?: TokenName;
  opacity?: number;
};

const getTextStyle = (
  variant: TextVariant,
  theme: ThemeType,
  ds: typeof DesignSystem,
  colorToken?: TokenName,
  opacity?: number,
) => {
  const brandFontMap: Partial<Record<TextVariant, keyof typeof ds.fonts>> = {
    callout: 'brand',
    headline: 'brand',
    interactive: 'brandMedium',
  };

  const variantFontKey = brandFontMap[variant];
  const baseStyle = {
    fontFamily: variantFontKey ? ds.fonts[variantFontKey] : ds.fonts.system,
  };

  const typographyStyle = ds.typography[variant];
  const fallbackStyle = ds.typography.body;
  const resolvedTypography = typographyStyle ?? fallbackStyle;
  const variantForColor = typographyStyle ? variant : 'body';

  // Determine color based on variant or token
  let textColor: string;

  if (colorToken) {
    textColor = theme[colorToken];
  } else if (variantForColor === 'secondary') {
    textColor = theme.muted;
  } else if (variantForColor === 'tertiary' || variantForColor === 'caption') {
    textColor = theme.muted;
  } else if (variantForColor === 'actionBar') {
    textColor = theme.muted;
  } else {
    textColor = theme.text;
  }

  // Apply custom opacity if provided
  if (opacity && opacity !== 1) {
    const hex = textColor.replace('#', '');
    if (hex.length === 6) {
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      textColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
  }

  const typographyWithFamily =
    resolvedTypography as typeof resolvedTypography & {
      fontFamily?: string;
    };
  const fontFamily = typographyWithFamily.fontFamily ?? baseStyle.fontFamily;

  return {
    ...baseStyle,
    fontFamily,
    fontSize: resolvedTypography.fontSize,
    lineHeight: resolvedTypography.lineHeight,
    fontWeight: resolvedTypography.fontWeight,
    letterSpacing: resolvedTypography.letterSpacing,
    color: textColor,
  };
};

export function ThemedText({
  variant = 'body',
  color,
  colorToken,
  opacity,
  style,
  ...props
}: ThemedTextProps) {
  const {theme, ds} = useTheme();

  const textStyle = getTextStyle(variant, theme, ds, colorToken, opacity);

  return <Text style={[textStyle, color && {color}, style]} {...props} />;
}
