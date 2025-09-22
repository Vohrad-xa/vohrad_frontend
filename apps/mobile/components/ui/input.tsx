import React, {forwardRef} from 'react';
import {TextInput, type TextInputProps, StyleSheet} from 'react-native';

import {useTheme} from '@/providers/theme-provider';

export type InputProps = TextInputProps;

export const Input = forwardRef<TextInput, InputProps>(({style, placeholderTextColor, ...props}, ref) => {
  const {theme, ds} = useTheme();

  return (
    <TextInput
      ref={ref}
      style={[
        styles.input,
        {
          backgroundColor: theme.input,
          color: theme.text,
          borderRadius: ds.borderRadius.xxxl,
          paddingVertical: ds.spacing.sm,
          paddingHorizontal: ds.spacing.md,
          fontSize: ds.typography.body.fontSize,
          fontWeight: ds.typography.body.fontWeight,
        },
        style,
      ]}
      placeholderTextColor={placeholderTextColor ?? theme.iosPlaceholder}
      {...props}
    />
  );
});

Input.displayName = 'Input';

const styles = StyleSheet.create({
  input: {
    flex: 1,
    borderWidth: 0,
    minHeight: 36,
    textAlign: 'left',
  },
});
