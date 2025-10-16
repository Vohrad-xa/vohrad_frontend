import {StyleSheet, Platform} from 'react-native';
import {GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useAnimatedProps,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import {SIDEBAR_CONFIG, BACKDROP_CONFIG} from '@/constants/sidebar';
import {type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {useSidebar} from '@/providers/sidebar-provider';
import {makeStyleFactory} from '@/utils/style-factory';
import type {SharedValue} from 'react-native-reanimated';

interface SidebarBackdropProps {
  slideAnim: SharedValue<number>;
}

export function SidebarBackdrop({slideAnim}: SidebarBackdropProps) {
  const {theme} = useTheme();
  const {tapGesture} = useSidebar();
  const styles = createStyles(theme);

  const backdropAnimatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: theme.background,
      opacity: interpolate(
        slideAnim.value,
        [0, SIDEBAR_CONFIG.width],
        [0, Platform.OS === 'web' ? 0 : BACKDROP_CONFIG.maxOpacity],
        Extrapolate.CLAMP,
      ),
    };
  });

  const animatedProps = useAnimatedProps(() => {
    // On web: backdrop never blocks interaction
    if (Platform.OS === 'web') {
      return {
        pointerEvents: 'none' as const,
      };
    }

    return {
      pointerEvents:
        slideAnim.value > 0 ? ('auto' as const) : ('none' as const),
    };
  });

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View
        animatedProps={animatedProps}
        style={[styles.backdrop, backdropAnimatedStyle]}
      />
    </GestureDetector>
  );
}

const createStyles = makeStyleFactory(
  (_theme: ThemeShape) =>
    StyleSheet.create({
      backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.85)',
        zIndex: BACKDROP_CONFIG.zIndex,
      },
    }),
  (theme) => theme.version.toString(),
);
