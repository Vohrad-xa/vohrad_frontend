import type {ViewStyle} from 'react-native';
import {BlurView} from 'expo-blur';
import Animated, {useAnimatedProps} from 'react-native-reanimated';
import type {BlurTint} from 'expo-blur';
import type {SharedValue} from 'react-native-reanimated';

const AnimatedBlurViewComponent = Animated.createAnimatedComponent(BlurView);

type AnimatedBlurViewProps = {
  blurIntensity: SharedValue<number>;
  tint: BlurTint;
  style?: ViewStyle;
  children: React.ReactNode;
};

export function AnimatedBlurView({
  blurIntensity,
  tint,
  style,
  children,
}: AnimatedBlurViewProps) {
  const animatedBlurProps = useAnimatedProps(() => ({
    intensity: blurIntensity.value,
  }));

  return (
    <AnimatedBlurViewComponent
      animatedProps={animatedBlurProps}
      tint={tint}
      style={style}
    >
      {children}
    </AnimatedBlurViewComponent>
  );
}
