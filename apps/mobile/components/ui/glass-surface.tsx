import React from 'react';
import { View, Platform, StyleProp, ViewStyle, StyleSheet } from 'react-native';
import { useTheme } from '@/providers/theme-provider';
import { DesignSystem, type BorderRadius, type Spacing } from '@/constants/typography';

type GlassVariant = 'ultraThin' | 'regular' | 'prominent' | 'chrome';

export interface GlassSurfaceProps {
  children?: React.ReactNode;
  variant?: GlassVariant;
  borderRadius?: BorderRadius;
  padding?: Spacing;
  style?: StyleProp<ViewStyle>;
}

export function GlassSurface({
  children,
  variant = 'regular',
  borderRadius = 'md',
  padding = 'lg',
  style,
}: GlassSurfaceProps) {
  const { scheme, tokens } = useTheme();

  const radiusValue = DesignSystem.borderRadius[borderRadius];
  const paddingValue = DesignSystem.spacing[padding];

  const intensityByVariant: Record<GlassVariant, number> = {
    ultraThin: 10,
    regular: 20,
    chrome: 28,
    prominent: 36,
  };

  const overlayAlphaByVariant: Record<GlassVariant, number> = {
    ultraThin: scheme === 'dark' ? 0.04 : 0.03,
    regular: scheme === 'dark' ? 0.08 : 0.06,
    chrome: scheme === 'dark' ? 0.12 : 0.08,
    prominent: scheme === 'dark' ? 0.16 : 0.12,
  };

  const borderW = variant === 'ultraThin' ? 0.5 : 1;

  const common: ViewStyle = {
    borderRadius: radiusValue,
    padding: paddingValue,
    borderColor: tokens.border,
    borderWidth: borderW,
    overflow: 'hidden',
  };

  // Prefer @callstack/liquid-glass when available and supported on iOS 26+
  try {
    const cs = require('@callstack/liquid-glass');
    const LiquidGlassView = cs?.LiquidGlassView as React.ComponentType<any> | undefined;
    const isSupported = cs?.isLiquidGlassSupported as boolean | undefined;
    if (LiquidGlassView && isSupported) {
      const effect = variant === 'ultraThin' ? 'clear' : 'regular';
      return (
        <LiquidGlassView interactive effect={effect} colorScheme={scheme} style={[common, style]}>
          {/* Optional subtle overlay for readability parity with blur fallback */}
          <View
            pointerEvents="none"
            style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor:
                scheme === 'dark'
                  ? `rgba(255,255,255,${overlayAlphaByVariant[variant]})`
                  : `rgba(0,0,0,${overlayAlphaByVariant[variant]})`,
            }}
          />
          {children}
        </LiquidGlassView>
      );
    }
  } catch {}

  // Prefer expo-blur when available
  try {
    const mod = require('expo-blur');
    const BlurView = (mod?.BlurView ?? mod) as React.ComponentType<any> | undefined;
    if (BlurView) {
      return (
        <BlurView
          intensity={intensityByVariant[variant]}
          tint={scheme === 'dark' ? 'dark' : 'light'}
          style={[common, style]}
        >
          {/* subtle overlay to ensure contrast on both themes */}
          <View
            pointerEvents="none"
            style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor:
                scheme === 'dark'
                  ? `rgba(255,255,255,${overlayAlphaByVariant[variant]})`
                  : `rgba(0,0,0,${overlayAlphaByVariant[variant]})`,
            }}
          />
          {/* top highlight for depth */}
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 1,
              backgroundColor: scheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.35)',
            }}
          />
          {children}
        </BlurView>
      );
    }
  } catch {}

  // Fallback: semi-transparent background
  const baseRGB = scheme === 'dark' ? '255,255,255' : '0,0,0';
  const overlayAlpha = overlayAlphaByVariant[variant];

  return <View style={[{ backgroundColor: `rgba(${baseRGB}, ${overlayAlpha})` }, common, style]}>{children}</View>;
}

export default GlassSurface;
