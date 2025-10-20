import React, {useRef, useEffect} from 'react';
import {
  TouchableOpacity,
  Animated,
  Platform,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type {ThemePreference} from '@/constants/colors';
import {type DSShape} from '@/constants/theme';
import {useHaptic} from '@/providers';
import {useTheme} from '@/providers/theme-provider';
import {Icon, AppIcons} from '@/utils';
import {makeStyleFactory} from '@/utils/style-factory';

interface CustomSwitchProps {
  style?: StyleProp<ViewStyle>;
}

export default function Switch({style}: CustomSwitchProps) {
  const {ds, theme, scheme, setScheme, preference} = useTheme();
  const {triggerHaptic} = useHaptic();
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const styles = createStyles(ds);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.parallel([
        Animated.timing(rotationAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
    ]).start(() => {
      rotationAnim.setValue(0);
    });
  }, [preference, rotationAnim, scaleAnim]);

  const handlePress = () => {
    triggerHaptic('selection');
    const nextValue: ThemePreference =
      preference === 'light'
        ? 'dark'
        : preference === 'dark'
          ? 'system'
          : 'light';
    setScheme(nextValue);
  };

  const iconName =
    preference === 'light'
      ? AppIcons.theme.light
      : preference === 'dark'
        ? AppIcons.theme.dark
        : scheme === 'light'
          ? AppIcons.theme.light
          : AppIcons.theme.dark;

  const rotation = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.container, style]}
      activeOpacity={0.7}
      accessibilityRole="switch"
      accessibilityState={{checked: preference !== 'system'}}
      accessibilityLabel={`Theme toggle. Currently ${preference} mode.`}
    >
      <Animated.View
        style={[
          styles.iconWrapper,
          {transform: [{rotate: rotation}, {scale: scaleAnim}]},
        ]}
      >
        <Icon name={iconName} size={ds.iconSize.md} color={theme.muted} />
      </Animated.View>
    </TouchableOpacity>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape) => {
    const baseSize = ds.components.tapTarget.minSize;

    return StyleSheet.create({
      container: {
        minWidth: baseSize,
        minHeight: baseSize,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: baseSize ? baseSize / 2 : ds.borderRadius.lg,
        alignSelf: 'center',
      },
      iconWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
      },
    });
  },
  (ds) => ds.version.toString(),
);
