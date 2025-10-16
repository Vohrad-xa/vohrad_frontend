import React from 'react';
import {
  TouchableOpacity,
  type TouchableOpacityProps,
  type ViewStyle,
  StyleSheet,
} from 'react-native';
import {useTheme} from '@/providers/theme-provider';
import {Icon} from '@/utils';
import {ThemedText} from './themed-text';
import {Palette, type ColorScheme} from '@/constants/colors';
import {makeStyleFactory} from '@/utils/style-factory';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import type {IconProps, ButtonBaseProps} from '@/types';

export interface ThemedButtonProps
  extends TouchableOpacityProps,
    Omit<ButtonBaseProps, 'style' | 'onPress' | 'onLongPress'>,
    Pick<IconProps, 'icon'> {
  title?: string;
  size?: 'sm' | 'md' | 'lg';
  iconPosition?: 'left' | 'right';
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

  const styles = createStyles(
    ds,
    theme,
    scheme,
    variant,
    fullWidth,
    disabled ?? loading,
    loading,
  );

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      disabled={disabled ?? loading}
      activeOpacity={0.7}
      {...props}
    >
      {icon && iconPosition === 'left' && (
        <Icon
          name={icon}
          size={ds.iconSize.md}
          color={styles.buttonText.color}
          style={styles.iconLeft}
        />
      )}
      {(hasTitle || loading) && (
        <ThemedText variant="body" style={styles.buttonText}>
          {titleContent}
        </ThemedText>
      )}
      {!hasTitle && children && children}
      {icon && iconPosition === 'right' && (
        <Icon
          name={icon}
          size={ds.iconSize.md}
          color={styles.buttonText.color}
          style={styles.iconRight}
        />
      )}
    </TouchableOpacity>
  );
};

const createStyles = makeStyleFactory(
  (
    ds: DSShape,
    theme: ThemeShape,
    scheme: ColorScheme,
    variant: ThemedButtonProps['variant'],
    fullWidth: boolean,
    disabled: boolean,
    loading: boolean,
  ) => {
    const getTextColor = (): string => {
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

    const buttonStyle: ViewStyle = {...baseStyle};

    if (fullWidth) {
      buttonStyle.width = '100%';
    }

    if (disabled || loading) {
      buttonStyle.backgroundColor = theme.surface;
      buttonStyle.borderColor = theme.border;
      buttonStyle.borderWidth = 1;
      buttonStyle.opacity = 0.6;
    } else {
      switch (variant) {
        case 'primary':
          buttonStyle.backgroundColor =
            scheme === 'dark' ? Palette.Lbackground : Palette.black;
          buttonStyle.borderColor =
            scheme === 'dark' ? Palette.Lbackground : Palette.Dbackground;
          buttonStyle.borderWidth = 1;
          break;
        case 'secondary':
          buttonStyle.backgroundColor = theme.surface;
          buttonStyle.borderColor = theme.border;
          buttonStyle.borderWidth = 1;
          break;
        case 'destructive':
          buttonStyle.backgroundColor = theme.destructive;
          buttonStyle.borderColor = theme.destructive;
          buttonStyle.borderWidth = 1;
          break;
        case 'ghost':
          buttonStyle.backgroundColor = 'transparent';
          buttonStyle.borderColor = 'transparent';
          buttonStyle.borderWidth = 0;
          break;
        default:
          break;
      }
    }

    return StyleSheet.create({
      button: buttonStyle,
      buttonText: {
        fontWeight: ds.fontWeight.semibold,
        color: textColor,
      },
      iconLeft: {
        marginRight: ds.spacing.xs,
      },
      iconRight: {
        marginLeft: ds.spacing.xs,
      },
    });
  },
  (ds, theme, scheme, variant, fullWidth, disabled, loading) =>
    `${themeKey(theme, ds)}|${scheme}|${variant}|${fullWidth}|${disabled}|${loading}`,
);
