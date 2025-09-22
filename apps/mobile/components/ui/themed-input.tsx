import React, {forwardRef} from 'react';
import {View, TextInput, type TextInputProps, type TextStyle} from 'react-native';
import {useTheme} from '@/providers/theme-provider';
import {Icon, type IconName} from '@/utils';
import {ThemedText} from './themed-text';

export interface ThemedInputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
}

export const ThemedInput = forwardRef<TextInput, ThemedInputProps>(
  ({label, error, icon, iconPosition = 'left', style, ...props}, ref) => {
    const {theme, ds} = useTheme();

    const inputStyle: TextStyle = {
      borderRadius: ds.components.input.borderRadius,
      borderWidth: ds.components.input.borderWidth,
      borderColor: error ? theme.destructive : theme.border,
      backgroundColor: theme.input,
      paddingHorizontal: ds.components.input.padding,
      paddingVertical: ds.components.input.padding,
      fontSize: ds.components.input.fontSize,
      color: theme.text,
      minHeight: ds.components.input.height,
      paddingLeft: icon && iconPosition === 'left' ? ds.spacing.xxxl : ds.components.input.padding,
      paddingRight: icon && iconPosition === 'right' ? ds.spacing.xxxl : ds.components.input.padding,
    };

    return (
      <View>
        {label && (
          <ThemedText variant="caption" style={{marginBottom: ds.spacing.xs}}>
            {label}
          </ThemedText>
        )}
        <View style={{position: 'relative'}}>
          <TextInput ref={ref} style={[inputStyle, style]} placeholderTextColor={theme.muted} {...props} />
          {icon && (
            <View
              style={{
                position: 'absolute',
                top: '50%',
                [iconPosition === 'left' ? 'left' : 'right']: ds.spacing.md,
                transform: [{translateY: -ds.iconSize.sm / 2}],
                minWidth: ds.components.tapTarget.minSize,
                minHeight: ds.components.tapTarget.minSize,
                justifyContent: 'center',
                alignItems: iconPosition === 'left' ? 'flex-start' : 'flex-end',
              }}>
              <Icon name={icon} size={ds.iconSize.md} color={theme.muted} />
            </View>
          )}
        </View>
        {error && (
          <ThemedText variant="caption" colorToken="destructive" style={{marginTop: ds.spacing.xs}}>
            {error}
          </ThemedText>
        )}
      </View>
    );
  },
);

ThemedInput.displayName = 'ThemedInput';
