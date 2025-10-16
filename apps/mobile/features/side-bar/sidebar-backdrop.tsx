import {StyleSheet} from 'react-native';
import {GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import {SIDEBAR_CONFIG, BACKDROP_CONFIG} from '@/constants/sidebar';
import {useTheme} from '@/providers';
import {useSidebar} from '@/providers/sidebar-provider';
import type {SharedValue} from 'react-native-reanimated';

interface SidebarBackdropProps {
  slideAnim: SharedValue<number>;
}

export function SidebarBackdrop({slideAnim}: SidebarBackdropProps) {
  const {theme} = useTheme();
  const {tapGesture} = useSidebar();

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: theme.background,
    opacity: interpolate(
      slideAnim.value,
      [0, SIDEBAR_CONFIG.width],
      [0, BACKDROP_CONFIG.maxOpacity],
      Extrapolate.CLAMP,
    ),
  }));

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View
        pointerEvents={slideAnim.value > 0 ? 'auto' : 'none'}
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: 'rgba(0,0,0,0.85)',
            zIndex: BACKDROP_CONFIG.zIndex,
          },
          backdropAnimatedStyle,
        ]}
      />
    </GestureDetector>
  );
}
