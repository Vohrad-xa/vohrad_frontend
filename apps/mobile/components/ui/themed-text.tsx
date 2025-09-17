import React from 'react';
import { Text, type TextProps } from 'react-native';
import { useTheme } from '@/providers/theme-provider';
import { type Typography } from '@/constants/typography';
import { type TokenName } from '@/constants/colors';

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
  theme: any,
  ds: any,
  colorToken?: TokenName,
  opacity?: number,
) => {
  const baseStyle = {
    fontFamily: 'System',
  };

  const typographyStyle = ds.typography[variant];

  if (!typographyStyle) {
    const fallbackStyle = ds.typography.body;
    return {
      ...baseStyle,
      fontSize: fallbackStyle.fontSize,
      lineHeight: fallbackStyle.lineHeight,
      fontWeight: fallbackStyle.fontWeight,
      letterSpacing: fallbackStyle.letterSpacing,
      color: theme.text,
    };
  }

  // Determine color based on variant or token
  let textColor: string;

  if (colorToken) {
    textColor = theme[colorToken];
  } else if (variant === 'secondary') {
    textColor = theme.muted;
  } else if (variant === 'tertiary' || variant === 'caption') {
    textColor = theme.muted;
  } else if (variant === 'actionBar') {
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

  return {
    ...baseStyle,
    fontSize: typographyStyle.fontSize,
    lineHeight: typographyStyle.lineHeight,
    fontWeight: typographyStyle.fontWeight,
    letterSpacing: typographyStyle.letterSpacing,
    color: textColor,
  };
};

export function ThemedText({ variant = 'body', color, colorToken, opacity, style, ...props }: ThemedTextProps) {
  const { theme, ds } = useTheme();

  const textStyle = getTextStyle(variant, theme, ds, colorToken, opacity);

  return (
    <Text
      style={[
        textStyle,
        color && { color }, // Override color if provided
        style,
      ]}
      {...props}
    />
  );
}
