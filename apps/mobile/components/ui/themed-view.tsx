import React from 'react';
import {View, type ViewProps, type ViewStyle, StyleSheet} from 'react-native';
import {useTheme} from '@/providers';
import {GlassCard} from './glass-card';
import {makeStyleFactory} from '@/utils/style-factory';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import type {ContainerStyleProps} from '@/types';

export interface ThemedViewProps
  extends ViewProps,
    Pick<ContainerStyleProps, 'contentStyle'> {
  variant?:
    | 'default'
    | 'card'
    | 'cardContent'
    | 'modal'
    | 'header'
    | 'headerAccessory'
    | 'listItem';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
}

export const ThemedView: React.FC<ThemedViewProps> = ({
  variant = 'default',
  shadow = 'none',
  style,
  contentStyle,
  ...props
}) => {
  const {theme, ds} = useTheme();

  // Special handling for card variant - delegate to GlassCard
  if (variant === 'card') {
    return <GlassCard style={style} contentStyle={contentStyle} {...props} />;
  }

  const styles = createStyles(variant, shadow, theme, ds);

  return <View style={[styles.view, style]} {...props} />;
};

const createStyles = makeStyleFactory(
  (
    variant: ThemedViewProps['variant'],
    shadow: ThemedViewProps['shadow'],
    theme: ThemeShape,
    ds: DSShape,
  ) => {
    const getVariantStyle = (): ViewStyle => {
      switch (variant) {
        case 'cardContent':
          return {
            flex: 1,
            padding: ds.spacing.md,
            flexDirection: 'column',
            justifyContent: 'space-between',
          };
        case 'modal':
          return {
            backgroundColor: theme.background,
            borderRadius: ds.components.modal.borderRadius,
            padding: ds.components.modal.padding,
          };
        case 'header':
          return {
            backgroundColor: theme.primary,
            paddingVertical: ds.spacing.md,
          };
        case 'headerAccessory':
          return {
            minWidth: ds.components.tapTarget.minSize,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: ds.spacing.md,
          };
        case 'listItem':
          return {
            backgroundColor: theme.background,
            minHeight: ds.components.listItem.minHeight,
            paddingVertical: ds.components.listItem.paddingVertical,
            paddingHorizontal: ds.components.listItem.paddingHorizontal,
          };
        default:
          return {
            backgroundColor: theme.background,
          };
      }
    };

    const getShadowStyle = (): ViewStyle => {
      switch (shadow) {
        case 'sm':
          return ds.shadows.sm;
        case 'md':
          return ds.shadows.md;
        case 'lg':
          return ds.shadows.lg;
        default:
          return {};
      }
    };

    return StyleSheet.create({
      view: {
        ...getVariantStyle(),
        ...getShadowStyle(),
      },
    });
  },
  (variant, shadow, theme, ds) => `${variant}|${shadow}|${themeKey(theme, ds)}`,
);
