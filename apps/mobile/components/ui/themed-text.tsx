import React, {useMemo} from 'react';
import {Platform, Text as RNText, type TextProps} from 'react-native';
import {Text as PaperText} from 'react-native-paper';
import {type TokenName, type Typography, getTextProps} from '@/constants';
import {useTheme} from '@/providers';

export type ThemedTextProps = TextProps & {
  variant?: Typography;
  color?: string;
  colorToken?: TokenName;
  opacity?: number;
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

export function ThemedText({
  variant = 'body',
  color,
  colorToken,
  opacity,
  style,
  dynamicTypeRamp,
  children,
  ...props
}: ThemedTextProps) {
  const {theme, ds} = useTheme();
  const typographyProps = getTextProps(variant, ds);

  const resolvedColor = useMemo(() => {
    let c: string;

    if (color) c = color;
    else if (colorToken) c = theme[colorToken];
    else if (variant === 'caption' || variant === 'caption2') c = theme.muted;
    else c = theme.text;

    return applyOpacity(c, opacity);
  }, [color, colorToken, opacity, theme, variant]);

  if (Platform.OS === 'ios') {
    return (
      <RNText
        {...props}
        dynamicTypeRamp={dynamicTypeRamp ?? typographyProps.dynamicTypeRamp}
        allowFontScaling={typographyProps.allowFontScaling}
        style={[
          {color: resolvedColor, fontSize: typographyProps.fontSize},
          style,
        ]}
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
        style={[{color: resolvedColor}, style]}
      >
        {children}
      </PaperText>
    );
  }

  return (
    <RNText
      {...props}
      allowFontScaling={typographyProps.allowFontScaling}
      style={[{color: resolvedColor}, style]}
    >
      {children}
    </RNText>
  );
}
