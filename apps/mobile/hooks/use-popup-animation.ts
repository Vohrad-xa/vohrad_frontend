import {useEffect, useRef} from 'react';
import {Animated} from 'react-native';

type UsePopupAnimationOptions = {
  isVisible: boolean;
  tension?: number;
  friction?: number;
  duration?: number;
};

export function usePopupAnimation({
  isVisible,
  tension = 120,
  friction = 10,
  duration = 200,
}: UsePopupAnimationOptions) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension,
          friction,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [isVisible, scaleAnim, opacityAnim, tension, friction, duration]);

  const animateOut = (onComplete?: () => void) => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete?.();
    });
  };

  const animatedStyle = {
    opacity: opacityAnim,
    transform: [
      {scale: scaleAnim},
      {
        translateY: scaleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-160, 0],
        }),
      },
      {
        translateX: scaleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-150, 0],
        }),
      },
    ],
  };

  return {
    animatedStyle,
    animateOut,
  };
}
