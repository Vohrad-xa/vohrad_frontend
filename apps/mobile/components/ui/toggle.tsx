import {useEffect, useMemo} from 'react';
import {Platform, StyleSheet, Switch as RNSwitch} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolateColor,
  runOnJS,
} from 'react-native-reanimated';
import type {DesignSystem} from '@/constants/typography';
import {useTheme, useHaptic} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';

interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  testID?: string;
  accessibilityLabel?: string;
}

export function Toggle({
  value,
  onValueChange,
  disabled = false,
  testID,
  accessibilityLabel,
}: ToggleProps) {
  const {theme, ds} = useTheme();
  const {isEnabled: hapticsEnabled, triggerHaptic} = useHaptic();
  const animatedValue = useSharedValue(value ? 1 : 0);
  const startValue = useSharedValue(0);
  const styles = useMemo(() => createStyles(ds, theme), [ds, theme]);

  // Wrap onValueChange to control haptics
  const handleChange = (newValue: boolean) => {
    if (hapticsEnabled) {
      triggerHaptic('selection');
    }
    onValueChange(newValue);
  };

  useEffect(() => {
    animatedValue.value = withSpring(value ? 1 : 0, {
      damping: 30,
      stiffness: 400,
    });
  }, [value, animatedValue]);

  const panGesture = Gesture.Pan()
    .enabled(!disabled)
    .onStart(() => {
      startValue.value = animatedValue.value;
    })
    .onUpdate((event) => {
      const newValue = startValue.value + event.translationX / 15;
      animatedValue.value = Math.max(0, Math.min(1, newValue));
    })
    .onEnd(() => {
      const shouldBeOn = animatedValue.value > 0.5;
      animatedValue.value = withSpring(shouldBeOn ? 1 : 0, {
        damping: 20,
        stiffness: 250,
      });
      if (shouldBeOn !== value) {
        if (hapticsEnabled) {
          runOnJS(triggerHaptic)('selection');
        }
        runOnJS(onValueChange)(shouldBeOn);
      }
    });

  const thumbAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{translateX: animatedValue.value * 16}],
  }));

  const trackAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      animatedValue.value,
      [0, 1],
      [theme.toggleTrackOff, theme.toggleTrackOn],
    ),
  }));

  if (Platform.OS === 'ios') {
    return (
      <RNSwitch
        value={value}
        onValueChange={handleChange}
        disabled={disabled}
        accessibilityRole="switch"
        accessibilityState={{disabled, checked: value}}
        accessibilityLabel={accessibilityLabel}
        testID={testID}
      />
    );
  }

  const tapGesture = Gesture.Tap()
    .enabled(!disabled)
    .onEnd(() => {
      if (hapticsEnabled) {
        runOnJS(triggerHaptic)('selection');
      }
      runOnJS(onValueChange)(!value);
    });

  const composedGesture = Gesture.Race(panGesture, tapGesture);

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View
        accessibilityRole="switch"
        accessibilityState={{disabled, checked: value}}
        accessibilityLabel={accessibilityLabel}
        testID={testID}
      >
        <Animated.View style={[styles.track, trackAnimatedStyle]}>
          <Animated.View style={[styles.thumb, thumbAnimatedStyle]} />
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const createStyles = makeStyleFactory(
  (ds: typeof DesignSystem, theme: ReturnType<typeof useTheme>['theme']) =>
    StyleSheet.create({
      track: {
        width: 50,
        height: 25,
        borderRadius: ds.borderRadius.xxl,
        padding: ds.spacing.xxs,
        justifyContent: 'center',
      },
      thumb: {
        width: 30,
        height: 22,
        borderRadius: ds.borderRadius.full,
        backgroundColor: theme.toggleThumb,
        ...ds.shadows.sm,
      },
    }),
  (ds, theme) => ds.version.toString() + theme.version.toString(),
);
