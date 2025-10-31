import type {FC} from 'react';
import {Platform, Pressable, StyleSheet, Text} from 'react-native';
import type {TokenName} from '@/constants/colors';
import {type DSShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import type {RequiredIconProps, BaseViewProps} from '@/types';
import {Icon, AppIcons, type IconName} from '@/utils';
import {makeStyleFactory} from '@/utils/style-factory';

export type HeaderButtonVariant =
  | 'close' // X icon, muted color
  | 'cancel' // "Cancel" text, destructive color
  | 'save' // "Save" text, accent green when has changes
  | 'edit' // "Edit" text, accent blue
  | 'success' // Check icon, accent green
  | 'action' // Any custom icon/text with accent blue
  | 'back'; // Back arrow icon

export interface HeaderButtonProps
  extends Omit<RequiredIconProps, 'icon'>,
    Pick<BaseViewProps, 'style' | 'accessibilityLabel' | 'testID'> {
  onPress?: () => void;
  variant?: HeaderButtonVariant;
  icon?: IconName;
  text?: string;
  textColor?: string;
  textColorToken?: TokenName;
  iconColor?: string;
  iconColorToken?: TokenName;
  iconSize?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
}

export const HeaderButton: FC<HeaderButtonProps> = ({
  variant,
  icon,
  text,
  onPress,
  iconColor,
  iconColorToken,
  textColor,
  textColorToken,
  iconSize,
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

  // Configure based on variant
  const variantConfig = (() => {
    switch (variant) {
      case 'close':
        return {
          icon: AppIcons.navigation.close,
          color: theme.muted,
          iconSize: 'lg' as const,
        };
      case 'cancel':
        return {
          text: 'Cancel',
          color: theme.destructive,
        };
      case 'save':
        return {
          text: 'Save',
          color: theme.text,
        };
      case 'success':
        return {
          icon: AppIcons.actions.save,
          color: theme.accentGreen,
          iconSize: 'xxl' as const,
        };
      case 'edit':
        return {
          text: 'Edit',
          color: theme.accentBlue,
        };
      case 'back':
        return {
          icon: AppIcons.navigation.back,
          color: theme.text,
          iconSize: 'lg' as const,
        };
      case 'action':
        return {
          color: theme.accentBlue,
        };
      default:
        return {
          color: theme.text,
        };
    }
  })();

  // Use variant config as defaults
  const finalIcon = icon ?? variantConfig.icon;
  const finalText = text ?? variantConfig.text;
  const finalIconSize = iconSize ?? variantConfig.iconSize ?? 'lg';
  const finalIconColor =
    iconColor ??
    (iconColorToken ? theme[iconColorToken as TokenName] : variantConfig.color);
  const finalTextColor =
    textColor ??
    (textColorToken ? theme[textColorToken as TokenName] : variantConfig.color);

  // Determine button content
  const buttonContent = finalIcon ? (
    <Icon
      name={finalIcon}
      color={finalIconColor}
      size={ds.iconSize[finalIconSize]}
    />
  ) : finalText ? (
    <Text style={[styles.text, {color: finalTextColor}]}>{finalText}</Text>
  ) : null;

  // Apply consistent padding for edit/save/cancel/success variants
  const isActionButton =
    variant === 'edit' ||
    variant === 'save' ||
    variant === 'cancel' ||
    variant === 'success';

  return (
    <Pressable
      style={[
        styles.button,
        isActionButton ? styles.actionButton : null,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel ??
        (finalText
          ? `${finalText} button`
          : finalIcon
            ? `${finalIcon} button`
            : 'button')
      }
      testID={testID}
      onPress={onPress}
      disabled={!onPress}
    >
      {buttonContent}
    </Pressable>
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
        alignSelf: 'center',
        ...Platform.select({
          android: {
            marginLeft: -8,
          },
        }),
      },
      actionButton: {
        paddingHorizontal: ds.spacing.lg,
      },
      text: {
        ...ds.typography.body,
      },
    }),
  (ds, baseSize) => baseSize.toString(),
);
