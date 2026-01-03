import React from 'react';
import {
  Platform,
  StyleSheet,
  Text as RNText,
  type TextProps,
} from 'react-native';
import {Text as PaperText} from 'react-native-paper';
import {
  getTextProps,
  themeKey,
  type TokenName,
  type Typography,
  type FontWeight,
  type DSShape,
  type ThemeShape,
} from '@/constants';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils';

export type ThemedTextProps = TextProps & {
  variant?: Typography;
  color?: string;
  colorToken?: TokenName;
  opacity?: number;
  fontWeight?: FontWeight;
};

const applyOpacity = (hexOrRgba: string, opacity?: number) => {
  if (opacity == null || opacity === 1) return hexOrRgba;
  if (!hexOrRgba.startsWith('#')) return hexOrRgba;

  const hex = hexOrRgba.slice(1);
  if (hex.length !== 6) return hexOrRgba;

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Theme-aware text that caches base styles per theme/version and variant, with optional per-instance color/opacity overrides.
 *
 * - iOS uses RNText + dynamicTypeRamp/fontSize; Android uses Paper variants.
 * - Base styles are versioned via makeStyleFactory; only color/opacity is applied dynamically when provided.
 */
export function ThemedText({
  variant = 'body',
  color,
  colorToken,
  opacity,
  fontWeight,
  style,
  dynamicTypeRamp,
  children,
  ...props
}: ThemedTextProps) {
  const {theme, ds} = useTheme();

  const typographyProps = getTextProps(variant, ds);

  const baseColor = colorToken
    ? theme[colorToken]
    : variant === 'caption' || variant === 'caption2'
      ? theme.muted
      : theme.text;

  const styles = createStyles(ds, theme, variant, baseColor, fontWeight);

  const baseStyle = Platform.OS === 'ios' ? styles.ios : styles.other;

  const resolvedColor = applyOpacity(color ?? baseColor, opacity);

  const dynamicStyle =
    resolvedColor !== baseColor ? {color: resolvedColor} : undefined;

  if (Platform.OS === 'ios') {
    return (
      <RNText
        {...props}
        dynamicTypeRamp={dynamicTypeRamp ?? typographyProps.dynamicTypeRamp}
        allowFontScaling={typographyProps.allowFontScaling}
        style={[baseStyle, dynamicStyle, style]}
      >
        {children}
      </RNText>
    );
  }

  if (Platform.OS === 'android') {
    return (
      <PaperText
        {...props}
        variant={typographyProps.variant}
        allowFontScaling={typographyProps.allowFontScaling}
        style={[baseStyle, dynamicStyle, style]}
      >
        {children}
      </PaperText>
    );
  }

  return (
    <RNText
      {...props}
      allowFontScaling={typographyProps.allowFontScaling}
      style={[baseStyle, dynamicStyle, style]}
    >
      {children}
    </RNText>
  );
}

const createStyles = makeStyleFactory(
  (
    ds: DSShape,
    _theme: ThemeShape,
    variant: Typography,
    baseColor: string,
    fontWeight: FontWeight | undefined,
  ) => {
    const typographyProps = getTextProps(variant, ds);
    const fontWeightValue = fontWeight ? ds.fontWeight[fontWeight] : undefined;

    return StyleSheet.create({
      ios: {
        color: baseColor,
        fontSize: typographyProps.fontSize,
        fontWeight: fontWeightValue,
      },
      other: {
        color: baseColor,
        fontWeight: fontWeightValue,
      },
    });
  },
  (ds, theme, variant, baseColor, fontWeight) =>
    `${themeKey(theme, ds)}|${variant}|${baseColor}|${fontWeight ?? 'default'}`,
);
