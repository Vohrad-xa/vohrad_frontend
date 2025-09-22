import React, {useState, useRef, useEffect} from 'react';
import {TouchableOpacity, Animated, Platform, type StyleProp, type ViewStyle} from 'react-native';
import * as Haptics from 'expo-haptics';
import {useTheme} from '@/providers/theme-provider';
import {Icon, AppIcons} from '@/utils';

interface CustomSwitchProps {
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  style?: StyleProp<ViewStyle>;
}

export default function Switch({value, onValueChange, style}: CustomSwitchProps) {
  const [internalValue, setInternalValue] = useState(false);
  const {ds, theme} = useTheme();
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const switchValue = value ?? internalValue;
  const handleChange = onValueChange ?? setInternalValue;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(rotationAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      rotationAnim.setValue(0);
    });
  }, [switchValue, rotationAnim, scaleAnim]);

  const handlePress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    }
    handleChange(!switchValue);
  };

  const iconName = switchValue ? AppIcons.theme.dark : AppIcons.theme.light;

  const rotation = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const baseSize = Platform.select({ios: 36, default: ds.components.tapTarget.minSize});

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
      accessibilityState={{checked: switchValue}}
      accessibilityLabel={`Theme toggle. Currently ${switchValue ? 'dark' : 'light'} mode.`}>
      <Animated.View
        style={{
          transform: [{rotate: rotation}, {scale: scaleAnim}],
        }}>
        <Icon name={iconName} size={ds.iconSize.md} color={theme.muted} />
      </Animated.View>
    </TouchableOpacity>
  );
}
