import React from 'react';
import {
  Platform,
  Text as RNText,
  type TextProps,
  type TextStyle,
} from 'react-native';
import {Text as PaperText} from 'react-native-paper';
import {
  useTypography,
  getDynamicTypeRamp,
  type TokenName,
  type Typography,
  type FontWeight,
} from '@/constants';
import {useTheme} from '@/providers';

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
 * Theme-aware text component. Uses `useTypography()` for cross-platform
 * font resolution (iOS dynamicTypeRamp / Android Paper fonts).
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
  const typography = useTypography();

  const baseColor = colorToken
    ? theme[colorToken]
    : variant === 'caption' || variant === 'caption2'
      ? theme.muted
      : theme.text;

  const resolvedColor = applyOpacity(color ?? baseColor, opacity);

  const textStyle: TextStyle = {
    ...typography[variant],
    color: resolvedColor,
    ...(fontWeight && {fontWeight: ds.fontWeight[fontWeight]}),
  };

  if (Platform.OS === 'ios') {
    return (
      <RNText
        {...props}
        dynamicTypeRamp={dynamicTypeRamp ?? getDynamicTypeRamp(variant)}
        allowFontScaling
        style={[textStyle, style]}
      >
        {children}
      </RNText>
    );
  }

  return (
    <PaperText {...props} allowFontScaling style={[textStyle, style]}>
      {children}
    </PaperText>
  );
}
