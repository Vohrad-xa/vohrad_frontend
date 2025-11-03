import React from 'react';
import {Text, type TextProps, StyleSheet} from 'react-native';
import type {TokenName} from '@/constants/colors';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import type {Typography} from '@/constants/typography';
import {useTheme} from '@/providers/theme-provider';
import {makeStyleFactory} from '@/utils/style-factory';

// Text variants based on typography system
export type TextVariant = Typography | 'badgeText';

export type ThemedTextProps = TextProps & {
  variant?: TextVariant;
  color?: string;
  colorToken?: TokenName;
  opacity?: number;
};

const createStyles = makeStyleFactory(
  (
    variant: TextVariant,
    theme: ThemeShape,
    ds: DSShape,
    colorToken?: TokenName,
    opacity?: number,
  ) => {
    // Handle badgeText variant specially
    if (variant === 'badgeText') {
      return StyleSheet.create({
        text: {
          fontFamily: ds.fonts.system,
          ...ds.typography.caption,
          fontWeight: ds.fontWeight.semibold,
          letterSpacing: 0.5,
          textTransform: 'uppercase',
          color: theme.primaryForeground,
        },
      });
    }

    const typographyStyle = ds.typography[variant as Typography];
    const resolvedTypography = typographyStyle ?? ds.typography.body;

    // Determine color based on variant or token
    let textColor: string;

    if (colorToken) {
      textColor = theme[colorToken];
    } else if (variant === 'secondary' || variant === 'caption') {
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

    return StyleSheet.create({
      text: {
        fontFamily: ds.fonts.system,
        fontSize: resolvedTypography.fontSize,
        lineHeight: resolvedTypography.lineHeight,
        fontWeight: resolvedTypography.fontWeight,
        letterSpacing: resolvedTypography.letterSpacing,
        color: textColor,
      },
    });
  },
  (variant, theme, ds, colorToken, opacity) =>
    `${variant}|${themeKey(theme, ds)}|${colorToken ?? ''}|${opacity ?? ''}`,
);

export function ThemedText({
  variant = 'body',
  color,
  colorToken,
  opacity,
  style,
  ...props
}: ThemedTextProps) {
  const {theme, ds} = useTheme();

  const styles = createStyles(variant, theme, ds, colorToken, opacity);

  return <Text style={[styles.text, color && {color}, style]} {...props} />;
}
