import {Platform, StyleSheet} from 'react-native';
import {GestureDetector} from 'react-native-gesture-handler';
import Animated, {interpolate, useAnimatedStyle} from 'react-native-reanimated';
import {BACKDROP_CONFIG, SIDEBAR_CONFIG} from '@/constants/sidebar';
import {useSidebar, useTheme} from '@/providers';
import type {SharedValue} from 'react-native-reanimated';

type SidebarBackdropProps = {
  slideAnim: SharedValue<number>;
};

export function SidebarBackdrop({slideAnim}: SidebarBackdropProps) {
  const {theme} = useTheme();
  const {tapGesture} = useSidebar();

  const style = useAnimatedStyle(() => {
    const isWeb = Platform.OS === 'web';
    const opacity = interpolate(
      slideAnim.value,
      [0, SIDEBAR_CONFIG.width],
      [0, isWeb ? 0 : BACKDROP_CONFIG.maxOpacity],
      'clamp',
    );

    return {
      opacity,
      backgroundColor: theme.sidebarBackground,
      // On web: never block clicks. On native: block only when open.
      pointerEvents: isWeb ? 'none' : slideAnim.value > 0 ? 'auto' : 'none',
    } as const;
  }, [theme.sidebarBackground]);

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View style={[styles.backdrop, style]} />
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: BACKDROP_CONFIG.zIndex,
  },
});
