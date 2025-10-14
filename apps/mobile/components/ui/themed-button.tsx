import React, {useMemo} from 'react';
import {
  TouchableOpacity,
  type TouchableOpacityProps,
  type ViewStyle,
} from 'react-native';
import {useTheme} from '@/providers/theme-provider';
import {Icon, type IconName} from '@/utils';
import {ThemedText} from './themed-text';
import {Palette} from '@/constants/colors';

export interface ThemedButtonProps extends TouchableOpacityProps {
  title?: string;
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
}

export const ThemedButton: React.FC<ThemedButtonProps> = ({
  title,
  variant = 'primary',
  icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  style,
  disabled,
  children,
  ...props
}) => {
  const {theme, ds, scheme} = useTheme();
  const hasTitle = typeof title === 'string';
  const titleContent = loading ? 'Loading...' : (title ?? '');

  const getTextColor = () => {
    if (disabled || loading) {
      return theme.muted;
    }

    switch (variant) {
      case 'primary':
        return scheme === 'dark' ? Palette.black : Palette.Lbackground;
      case 'secondary':
        return theme.text;
      case 'destructive':
        return theme.destructiveForeground;
      case 'ghost':
        return theme.text;
      default:
        return theme.primaryForeground;
    }
  };

  const textColor = getTextColor();
  const buttonTextStyle = useMemo(
    () => ({fontWeight: ds.fontWeight.semibold, color: textColor}),
    [ds.fontWeight.semibold, textColor],
  );

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: ds.components.button.borderRadius,
      paddingHorizontal: ds.components.button.paddingHorizontal,
      paddingVertical: ds.components.button.paddingVertical,
      minHeight: ds.components.button.height,
      minWidth: ds.components.tapTarget.minSize,
    };

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    if (disabled || loading) {
      return {
        ...baseStyle,
        backgroundColor: theme.surface,
        borderColor: theme.border,
        borderWidth: 1,
        opacity: 0.6,
      };
    }

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor:
            scheme === 'dark' ? Palette.Lbackground : Palette.black,
          borderColor:
            scheme === 'dark' ? Palette.Lbackground : Palette.Dbackground,
          borderWidth: 1,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: theme.surface,
          borderColor: theme.border,
          borderWidth: 1,
        };
      case 'destructive':
        return {
          ...baseStyle,
          backgroundColor: theme.destructive,
          borderColor: theme.destructive,
          borderWidth: 1,
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          borderWidth: 0,
        };
      default:
        return baseStyle;
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      disabled={disabled ?? loading}
      activeOpacity={0.7}
      {...props}
    >
      {icon && iconPosition === 'left' && (
        <Icon
          name={icon}
          size={ds.iconSize.md}
          color={textColor}
          style={{marginRight: ds.spacing.xs}}
        />
      )}
      {(hasTitle || loading) && (
        <ThemedText variant="body" style={buttonTextStyle}>
          {titleContent}
        </ThemedText>
      )}
      {!hasTitle && children && children}
      {icon && iconPosition === 'right' && (
        <Icon
          name={icon}
          size={ds.iconSize.md}
          color={textColor}
          style={{marginLeft: ds.spacing.xs}}
        />
      )}
    </TouchableOpacity>
  );
};
