import React, {forwardRef} from 'react';
import {
  Platform,
  StyleSheet,
  TextInput,
  type TextInputProps,
} from 'react-native';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import type {Typography} from '@/constants/typography';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';

export type ThemedInputProps = TextInputProps & {
  variant?: Typography;
  textAlign?: 'left' | 'center' | 'right';
  borderless?: boolean;
};

export const ThemedInput = forwardRef<TextInput, ThemedInputProps>(
  (
    {
      variant = 'body',
      textAlign = 'left',
      borderless = false,
      style,
      placeholderTextColor,
      ...props
    },
    ref,
  ) => {
    const {theme, ds} = useTheme();
    const styles = createStyles(ds, theme, variant, textAlign, borderless);

    return (
      <TextInput
        ref={ref}
        style={[styles.input, style]}
        placeholderTextColor={placeholderTextColor ?? theme.muted}
        textAlign={textAlign}
        {...props}
      />
    );
  },
);

ThemedInput.displayName = 'ThemedInput';

const createStyles = makeStyleFactory(
  (
    ds: DSShape,
    theme: ThemeShape,
    variant: Typography,
    textAlign: 'left' | 'center' | 'right',
    borderless: boolean,
  ) => {
    const typographyStyle = ds.typography[variant];
    const resolvedTypography = typographyStyle ?? ds.typography.body;

    // Match ThemedText color logic
    const textColor =
      variant === 'secondary' || variant === 'caption' || variant === 'value'
        ? theme.muted
        : theme.text;

    return StyleSheet.create({
      input: {
        fontFamily: ds.fonts.system,
        color: textColor,
        fontSize: resolvedTypography.fontSize,
        lineHeight: resolvedTypography.lineHeight,
        fontWeight: resolvedTypography.fontWeight,
        letterSpacing: resolvedTypography.letterSpacing,
        padding: 0,
        textAlign,
        minWidth: 100,
        ...(borderless
          ? {
              borderWidth: 0,
              ...Platform.select({
                web: {
                  boxShadow: 'none',
                  outlineWidth: 0,
                },
              }),
            }
          : {}),
      },
    });
  },
  (ds, theme, variant, textAlign, borderless) =>
    `${variant}|${themeKey(theme, ds)}|${textAlign}|${borderless}`,
);
