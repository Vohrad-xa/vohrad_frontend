import React, {useEffect, useState} from 'react';
import {
  Platform,
  View,
  type StyleProp,
  type ViewStyle,
  AccessibilityInfo,
} from 'react-native';
import {usePlatformStyles} from '@/hooks';
import {useTheme} from '@/providers';

interface GlassViewProps {
  glassEffectStyle?: string;
  tintColor?: string;
  isInteractive?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

interface GlassContainerProps {
  spacing?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

interface GlassEffectModule {
  GlassView?: React.ComponentType<GlassViewProps>;
  GlassContainer?: React.ComponentType<GlassContainerProps>;
  isLiquidGlassAvailable?: () => boolean;
  default?: React.ComponentType<GlassViewProps>;
}

export interface GlassCardProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

export function GlassCard({children, style, contentStyle}: GlassCardProps) {
  const {scheme, ds, theme} = useTheme();
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

  // Platform-aware fallback background styles
  const fallbackCardStyles = usePlatformStyles({
    mobile: {
      borderRadius: ds.components.card.borderRadius,
      flex: 1,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: 'visible',
    },
    web: {
      borderRadius: ds.components.card.borderRadius,
      flex: 1,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
    },
  });

  if (Platform.OS === 'ios' && !reduceTransparency) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mod = require('expo-glass-effect') as GlassEffectModule;
      const GlassView = (mod?.GlassView ?? mod) as
        | React.ComponentType<GlassViewProps>
        | undefined;
      const GlassContainer = (mod?.GlassContainer ?? mod) as
        | React.ComponentType<GlassContainerProps>
        | undefined;
      const isLiquidGlassAvailable = mod?.isLiquidGlassAvailable;

      if (
        GlassView &&
        GlassContainer &&
        (!isLiquidGlassAvailable || isLiquidGlassAvailable())
      ) {
        return (
          <GlassContainer spacing={ds.spacing.xs} style={style}>
            <GlassView
              glassEffectStyle={scheme === 'dark' ? 'clear' : 'regular'}
              tintColor={theme.glassTint}
              isInteractive
              style={[
                {borderRadius: ds.components.card.borderRadius, flex: 1},
                contentStyle,
              ]}
            >
              {children}
            </GlassView>
          </GlassContainer>
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

export default GlassCard;
