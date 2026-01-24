import React from 'react';
import {
  TouchableOpacity,
  type TouchableOpacityProps,
  type ViewStyle,
  StyleSheet,
} from 'react-native';
import {Palette, type ColorScheme} from '@/constants/colors';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import type {IconProps, ButtonBaseProps} from '@/types';
import {Icon, makeStyleFactory} from '@/utils';
import {ThemedText} from './themed-text';

export interface ThemedButtonProps
  extends
    TouchableOpacityProps,
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
  size = 'md',
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
    size,
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
    size: 'sm' | 'md' | 'lg',
    disabled: boolean,
    loading: boolean,
  ) => {
    const getTextColor = (): string => {
      if (disabled || loading) {
        return theme.muted;
      }

      switch (variant) {
        case 'primary':
          return scheme === 'dark' ? Palette.black : Palette.charcoalA45;
        case 'secondary':
          return theme.text;
        case 'destructive':
          return Palette.white;
        case 'ghost':
          return theme.text;
        default:
          return theme.text;
      }
    };

    const textColor = getTextColor();

    const getSizePadding = () => {
      switch (size) {
        case 'sm':
          return {
            paddingHorizontal: ds.spacing.md,
            paddingVertical: ds.spacing.xs,
            minHeight: 32,
          };
        case 'lg':
          return {
            paddingHorizontal: ds.spacing.xl,
            paddingVertical: ds.spacing.md,
            minHeight: ds.components.button.height + 8,
          };
        default:
          return {
            paddingHorizontal: ds.components.button.paddingHorizontal,
            paddingVertical: ds.components.button.paddingVertical,
            minHeight: ds.components.button.height,
          };
      }
    };

    const sizePadding = getSizePadding();

    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: ds.components.button.borderRadius,
      ...sizePadding,
      minWidth: size === 'sm' ? undefined : ds.components.tapTarget.minSize,
    };

    const buttonStyle: ViewStyle = {...baseStyle};

    if (fullWidth) {
      buttonStyle.width = '100%';
    }

    if (disabled || loading) {
      buttonStyle.backgroundColor = theme.background;
      buttonStyle.borderColor = theme.border;
      buttonStyle.borderWidth = 1;
      buttonStyle.opacity = 0.6;
    } else {
      switch (variant) {
        case 'primary':
          buttonStyle.backgroundColor =
            scheme === 'dark' ? Palette.charcoalA45 : Palette.black;
          buttonStyle.borderColor =
            scheme === 'dark' ? Palette.charcoalA45 : Palette.charcoalA45;
          buttonStyle.borderWidth = 1;
          break;
        case 'secondary':
          buttonStyle.borderColor = theme.border;
          buttonStyle.borderWidth = 1;
          break;
        case 'destructive':
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
        marginRight: 0,
      },
      iconRight: {
        marginLeft: 0,
      },
    });
  },
  (ds, theme, scheme, variant, fullWidth, size, disabled, loading) =>
    `${themeKey(theme, ds)}|${scheme}|${variant}|${fullWidth}|${size}|${disabled}|${loading}`,
);
