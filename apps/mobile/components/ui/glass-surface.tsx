import React from 'react';
import {StyleSheet, View} from 'react-native';
import {BlurView} from 'expo-blur';
import {useTheme} from '@/providers';
import type {BaseViewProps} from '@/types';
import {makeStyleFactory} from '@/utils/style-factory';

export interface GlassSurfaceProps extends BaseViewProps {
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
  const styles = createStyles();

  return (
    <View style={[style, styles.container]}>
      <BlurView
        intensity={intensity ?? 20}
        tint={tint ?? (scheme === 'dark' ? 'dark' : 'light')}
        experimentalBlurMethod="dimezisBlurView"
        style={styles.blurView}
      >
        <View style={styles.childrenContainer}>{children}</View>
      </BlurView>
    </View>
  );
}

const createStyles = makeStyleFactory(
  () =>
    StyleSheet.create({
      container: {
        overflow: 'hidden',
      },
      blurView: {
        flex: 1,
      },
      childrenContainer: {
        flex: 1,
      },
    }),
  () => 'glass-surface',
);

export default GlassSurface;
