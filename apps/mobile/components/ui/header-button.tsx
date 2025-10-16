import {
  Platform,
  TouchableOpacity,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type {TokenName} from '@/constants/colors';
import {useTheme} from '@/providers';
import {Icon, type IconName} from '@/utils';

interface HeaderButtonProps {
  icon: IconName;
  onPress?: () => void;
  color?: string;
  colorToken?: TokenName;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function HeaderButton({
  icon,
  onPress,
  color,
  colorToken = 'muted',
  size = 'lg',
  accessibilityLabel,
  style,
}: HeaderButtonProps) {
  const {theme, ds} = useTheme();
  const baseSize = Platform.select({
    ios: 36,
    default: ds.components.tapTarget.minSize,
  });
  const iconColor = color ?? theme[colorToken];

  return (
    <TouchableOpacity
      style={[
        {
          minWidth: baseSize,
          minHeight: baseSize,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: baseSize ? baseSize / 2 : ds.borderRadius.lg,
          alignSelf: 'center',
          ...(Platform.OS === 'android' && {marginLeft: -8}),
        },
        style,
      ]}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
    >
      <Icon name={icon} color={iconColor} size={ds.iconSize[size]} />
    </TouchableOpacity>
  );
}
