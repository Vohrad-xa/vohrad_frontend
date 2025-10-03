import React, {useRef, useEffect} from 'react';
import {
  TouchableOpacity,
  Animated,
  Platform,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {impactAsync, ImpactFeedbackStyle} from 'expo-haptics';
import type {ThemePreference} from '@/constants/colors';
import {useTheme} from '@/providers/theme-provider';
import {Icon, AppIcons} from '@/utils';

interface CustomSwitchProps {
  style?: StyleProp<ViewStyle>;
}

export default function Switch({style}: CustomSwitchProps) {
  const {ds, theme, scheme, setScheme, preference} = useTheme();
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

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
    if (Platform.OS === 'ios') {
      impactAsync(ImpactFeedbackStyle.Light).catch(() => undefined);
    }
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

  const baseSize = ds.components.tapTarget.minSize;

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        {
          minWidth: baseSize,
          minHeight: baseSize,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: baseSize ? baseSize / 2 : ds.borderRadius.lg,
          alignSelf: 'center',
        },
        style,
      ]}
      activeOpacity={0.7}
      accessibilityRole="switch"
      accessibilityState={{checked: preference !== 'system'}}
      accessibilityLabel={`Theme toggle. Currently ${preference} mode.`}
    >
      <Animated.View
        style={{
          transform: [{rotate: rotation}, {scale: scaleAnim}],
        }}
      >
        <Icon name={iconName} size={ds.iconSize.md} color={theme.muted} />
      </Animated.View>
    </TouchableOpacity>
  );
}
