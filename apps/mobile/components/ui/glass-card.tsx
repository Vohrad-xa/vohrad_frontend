import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, Platform, View } from 'react-native';
import { GlassSurface } from '@/components/ui/glass-surface';
import { useTheme } from '@/providers/theme-provider';

export interface GlassCardProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

export function GlassCard({ children, style, contentStyle }: GlassCardProps) {
  const { scheme } = useTheme();
  if (Platform.OS === 'ios') {
    try {
      const mod = require('expo-glass-effect');
      const GlassView = (mod?.GlassView ?? mod) as React.ComponentType<any> | undefined;
      const GlassContainer = (mod?.GlassContainer ?? mod) as React.ComponentType<any> | undefined;
      if (GlassView && GlassContainer) {
        return (
          <GlassContainer spacing={10} style={style}>
            <GlassView glassEffectStyle="clear" style={[styles.card, { flex: 1 }, contentStyle]}>
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
        style={[styles.card, { flex: 1 }, contentStyle]}
        tint={scheme === 'light' ? 'dark' : 'light'}
        intensity={25}
      >
        {children}
      </GlassSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(33, 32, 31, 0.26)',
  },
});

export default GlassCard;
