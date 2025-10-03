import {StyleSheet} from 'react-native';
import {GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
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
      [0, 320],
      [0, 0.85],
      Extrapolate.CLAMP,
    ),
    display: slideAnim.value > 0 ? 'flex' : 'none',
  }));

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View
        style={[
          {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0,0,0,0.85)',
            zIndex: 999,
          },
          backdropAnimatedStyle,
        ]}
      />
    </GestureDetector>
  );
}
