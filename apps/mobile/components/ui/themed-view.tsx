import React from 'react';
import {View, type ViewProps, type ViewStyle} from 'react-native';
import {useTheme} from '@/providers';
import {GlassCard} from './glass-card';

export interface ThemedViewProps extends ViewProps {
  variant?: 'default' | 'card' | 'cardContent' | 'modal' | 'header' | 'headerAccessory' | 'listItem';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  contentStyle?: ViewStyle;
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

  // Regular variants for non-card components
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

  return <View style={[getVariantStyle(), getShadowStyle(), style]} {...props} />;
};
