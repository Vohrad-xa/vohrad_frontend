import React, {useEffect, useState} from 'react';
import {
  Platform,
  View,
  type StyleProp,
  type ViewStyle,
  AccessibilityInfo,
  StyleSheet,
} from 'react-native';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import type {ContainerStyleProps} from '@/types';
import {makeStyleFactory} from '@/utils/style-factory';

interface GlassViewProps {
  glassEffectStyle?: string;
  tintColor?: string;
  isInteractive?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

interface GlassEffectModule {
  GlassView?: React.ComponentType<GlassViewProps>;
  isLiquidGlassAvailable?: () => boolean;
  default?: React.ComponentType<GlassViewProps>;
}

export interface GlassCardProps extends ContainerStyleProps {
  children?: React.ReactNode;
  glassEffectStyle?: 'regular' | 'clear';
  isInteractive?: boolean;
}

export function GlassCard({
  children,
  style,
  contentStyle,
  glassEffectStyle = 'regular',
  isInteractive,
}: GlassCardProps) {
  const {ds, theme} = useTheme();
  const [reduceTransparency, setReduceTransparency] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      let mounted = true;
      AccessibilityInfo.isReduceTransparencyEnabled()
        .then((enabled) => {
          if (mounted) {
            setReduceTransparency(enabled);
          }
        })
        .catch(() => {
          if (mounted) {
            setReduceTransparency(false);
          }
        });

      return () => {
        mounted = false;
      };
    }
  }, []);

  const styles = createStyles(ds, theme);

  const fallbackCardStyles = Platform.select({
    web: styles.fallbackCardWeb,
    default: styles.fallbackCardMobile,
  });

  if (Platform.OS === 'ios' && !reduceTransparency) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mod = require('expo-glass-effect') as GlassEffectModule;
      const GlassView = (mod?.GlassView ?? mod) as
        | React.ComponentType<GlassViewProps>
        | undefined;
      const isLiquidGlassAvailable = mod?.isLiquidGlassAvailable;

      if (GlassView && (!isLiquidGlassAvailable || isLiquidGlassAvailable())) {
        return (
          <View style={style}>
            <GlassView
              glassEffectStyle={glassEffectStyle}
              style={[styles.glassView, contentStyle]}
              isInteractive={isInteractive}
            >
              {children}
            </GlassView>
          </View>
        );
      }
    } catch {}
  }

  return (
    <View style={style}>
      <View style={[fallbackCardStyles, contentStyle]}>{children}</View>
    </View>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      fallbackCardMobile: {
        borderRadius: ds.components.card.borderRadius,
        flex: 1,
        backgroundColor: theme.card,
        // borderWidth: 0.5,
        // borderColor: theme.border,
        overflow: 'visible',
      },
      fallbackCardWeb: {
        borderRadius: ds.components.card.borderRadius,
        flex: 1,
        backgroundColor: theme.card,
        // borderWidth: 0.5,
        // // borderColor: theme.border,
      },
      glassView: {
        borderRadius: ds.components.card.borderRadius,
        flex: 1,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);

export default GlassCard;
