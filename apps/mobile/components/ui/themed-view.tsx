import React from 'react';
import {View, type ViewProps, type ViewStyle, StyleSheet} from 'react-native';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import type {ContainerStyleProps} from '@/types';
import {makeStyleFactory} from '@/utils/style-factory';
import {GlassCard} from '../cards/glass-card';

export type BadgeStatus =
  | 'success'
  | 'error'
  | 'inactive'
  | 'maintenance'
  | 'active'
  | 'suspended';

export interface ThemedViewProps
  extends ViewProps, Pick<ContainerStyleProps, 'contentStyle'> {
  variant?:
    | 'default'
    | 'card'
    | 'cardContent'
    | 'modal'
    | 'header'
    | 'headerAccessory'
    | 'listItem'
    | 'badge'
    | 'statusBadge'
    | 'roleBadge';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  badgeStatus?: BadgeStatus;
}

export const ThemedView: React.FC<ThemedViewProps> = ({
  variant = 'default',
  shadow = 'none',
  badgeStatus,
  style,
  contentStyle,
  ...props
}) => {
  const {theme, ds, scheme} = useTheme();

  // Special handling for card variant - delegate to GlassCard
  if (variant === 'card') {
    return (
      <GlassCard
        style={style}
        contentStyle={contentStyle}
        {...props}
        glassEffectStyle={scheme === 'dark' ? 'clear' : 'regular'}
        isInteractive
      />
    );
  }

  const styles = createStyles(variant, shadow, badgeStatus, theme, ds);

  return <View style={[styles.view, style]} {...props} />;
};

const getStatusColor = (status: BadgeStatus, theme: ThemeShape): string => {
  switch (status) {
    case 'success':
    case 'active':
      return theme.accentGreen;
    case 'error':
      return theme.destructive;
    case 'inactive':
      return theme.muted;
    case 'maintenance':
      return theme.accentOrange;
    case 'suspended':
      return theme.accentYellow;
    default:
      return theme.primary;
  }
};

const createStyles = makeStyleFactory(
  (
    variant: ThemedViewProps['variant'],
    shadow: ThemedViewProps['shadow'],
    badgeStatus: BadgeStatus | undefined,
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
        case 'badge':
        case 'statusBadge':
        case 'roleBadge':
          return {
            borderRadius: ds.borderRadius.xxl,
            paddingVertical: ds.spacing.xxs,
            paddingHorizontal: ds.spacing.sm,
            borderWidth: 0,
            alignSelf: 'flex-start',
            backgroundColor:
              variant === 'statusBadge' && badgeStatus
                ? getStatusColor(badgeStatus, theme)
                : theme.primary,
          };
        default:
          return {
            // backgroundColor:
            //   Platform.OS === 'web' ? theme.webbackground : theme.background,
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
  (variant, shadow, badgeStatus, theme, ds) =>
    `${variant}|${shadow}|${badgeStatus ?? ''}|${themeKey(theme, ds)}`,
);
