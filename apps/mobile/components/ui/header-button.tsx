import type {FC} from 'react';
import {Platform, TouchableOpacity, StyleSheet} from 'react-native';
import type {TokenName} from '@/constants/colors';
import {type DSShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import type {RequiredIconProps, BaseViewProps} from '@/types';
import {Icon} from '@/utils';
import {makeStyleFactory} from '@/utils/style-factory';

export interface HeaderButtonProps
  extends RequiredIconProps,
    Pick<BaseViewProps, 'style' | 'accessibilityLabel' | 'testID'> {
  onPress?: () => void;
}

export const HeaderButton: FC<HeaderButtonProps> = ({
  icon,
  onPress,
  iconColor,
  iconColorToken,
  iconSize = 'lg',
  accessibilityLabel,
  testID,
  style,
}) => {
  const {theme, ds} = useTheme();
  const baseSize = Platform.select({
    ios: 36,
    default: ds.components.tapTarget.minSize,
  });
  const styles = createStyles(ds, baseSize);

  const finalIconColor =
    iconColor ??
    (iconColorToken ? theme[iconColorToken as TokenName] : theme.muted);

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? `${icon} button`}
      testID={testID}
      onPress={onPress}
      disabled={!onPress}
    >
      <Icon name={icon} color={finalIconColor} size={ds.iconSize[iconSize]} />
    </TouchableOpacity>
  );
};

const createStyles = makeStyleFactory(
  (ds: DSShape, baseSize: number) =>
    StyleSheet.create({
      button: {
        minWidth: baseSize,
        minHeight: baseSize,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: baseSize ? baseSize / 2 : ds.borderRadius.lg,
        alignSelf: 'center',
        ...Platform.select({
          android: {
            marginLeft: -8,
          },
        }),
      },
    }),
  (ds, baseSize) => baseSize.toString(),
);
