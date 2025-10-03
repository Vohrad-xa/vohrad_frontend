import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {BlurView} from 'expo-blur';
import {useTheme} from '@/providers';

export interface GlassSurfaceProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  tint?: 'default' | 'light' | 'dark';
  bordered?: boolean;
}

export function GlassSurface({
  children,
  style,
  intensity,
  tint,
}: GlassSurfaceProps) {
  const {scheme} = useTheme();

  return (
    <View style={[style, {overflow: 'hidden'}]}>
      <BlurView
        intensity={intensity ?? 20}
        tint={tint ?? (scheme === 'dark' ? 'dark' : 'light')}
        experimentalBlurMethod="dimezisBlurView"
        style={{flex: 1}}
      >
        <View style={{flex: 1}}>{children}</View>
      </BlurView>
    </View>
  );
}

export default GlassSurface;
