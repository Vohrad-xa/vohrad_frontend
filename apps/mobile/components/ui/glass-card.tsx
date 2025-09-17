import React from 'react';
import { Platform, View, type StyleProp, type ViewStyle } from 'react-native';
import { GlassSurface } from '@/components/ui/glass-surface';
import { useTheme } from '@/providers/theme-provider';

export interface GlassCardProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

export function GlassCard({ children, style, contentStyle }: GlassCardProps) {
  const { scheme, ds } = useTheme();
  if (Platform.OS === 'ios') {
    try {
      const mod = require('expo-glass-effect');
      const GlassView = (mod?.GlassView ?? mod) as React.ComponentType<any> | undefined;
      const GlassContainer = (mod?.GlassContainer ?? mod) as React.ComponentType<any> | undefined;
      if (GlassView && GlassContainer) {
        return (
          <GlassContainer spacing={ds.spacing.xs} style={style}>
            <GlassView
              glassEffectStyle="clear"
              style={[{ borderRadius: ds.components.card.borderRadius, flex: 1 }, contentStyle]}
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
      <GlassSurface
        style={[{ borderRadius: ds.components.card.borderRadius, flex: 1 }, contentStyle]}
        tint={scheme === 'light' ? 'dark' : 'light'}
        intensity={25}
      >
        {children}
      </GlassSurface>
    </View>
  );
}

export default GlassCard;
