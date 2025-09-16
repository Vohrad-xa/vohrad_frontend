import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '@/providers/theme-provider';

export interface GlassSurfaceProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  tint?: 'default' | 'light' | 'dark';
}

export function GlassSurface({ children, style, intensity, tint }: GlassSurfaceProps) {
  const { scheme } = useTheme?.() ?? ({ scheme: 'light' } as any);
  try {
    const mod = require('expo-blur');
    const BlurView = (mod?.BlurView ?? mod) as React.ComponentType<any> | undefined;
    if (BlurView) {
      return (
        <BlurView
          intensity={intensity ?? (scheme === 'dark' ? 40 : 80)}
          tint={tint ?? (scheme === 'dark' ? 'dark' : 'default')}
          style={style}
        >
          {children}
        </BlurView>
      );
    }
  } catch {}

  // Fallback: transparent passthrough.
  return <View style={style}>{children}</View>;
}

export default GlassSurface;
