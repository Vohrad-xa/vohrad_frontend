import type {FC} from 'react';
import {Platform, Pressable, StyleSheet, Text} from 'react-native';
import {SymbolView} from 'expo-symbols';
import type {TokenName} from '@/constants/colors';
import {type DSShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import type {RequiredIconProps, BaseViewProps} from '@/types';
import {
  Icon,
  AppIcons,
  SFSymbols,
  type IconName,
  type SFSymbolName,
} from '@/utils';
import {makeStyleFactory} from '@/utils/style-factory';

export type HeaderButtonVariant =
  | 'close'
  | 'cancel'
  | 'save'
  | 'edit'
  | 'add'
  | 'more'
  | 'success'
  | 'action'
  | 'back'
  | 'secondary'
  | 'destructive'
  | 'menu';

export interface HeaderButtonProps
  extends
    Omit<RequiredIconProps, 'icon'>,
    Pick<BaseViewProps, 'style' | 'accessibilityLabel' | 'testID'> {
  onPress?: () => void;
  variant?: HeaderButtonVariant;
  icon?: IconName;
  sfSymbol?: SFSymbolName;
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
  sfSymbol,
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
    ios: ds.spacing.xxl + ds.spacing.xs,
    default: ds.spacing.xxl,
  });
  const styles = createStyles(ds, baseSize);

  // Configure based on variant
  const variantConfig = (() => {
    switch (variant) {
      case 'close':
        return {
          icon: AppIcons.navigation.close,
          color: theme.text,
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
      case 'add':
        return {
          icon: AppIcons.actions.add,
          color: theme.accentBlue,
          iconSize: 'lg' as const,
        };
      case 'more':
        return {
          icon: AppIcons.navigation.more,
          sfSymbol: SFSymbols.ellipsis,
          iconSize: 'lg' as const,
          color: Platform.OS !== 'ios' ? theme.headerAndroid : theme.text,
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
      case 'secondary':
        return {
          color: theme.accentBlue,
        };
      case 'destructive':
        return {
          color: theme.destructive,
        };
      case 'menu':
        return {
          icon: AppIcons.navigation.menu,
          iconSize: 'xl' as const,
        };
      default:
        return {
          iconSize: Platform.OS === 'ios' ? ('xl' as const) : ('md' as const),
          color: theme.text,
        };
    }
  })();

  // Use variant config as defaults
  const finalIcon = icon ?? variantConfig.icon;
  const finalSfSymbol = sfSymbol ?? variantConfig.sfSymbol;
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
    Platform.OS === 'ios' && finalSfSymbol ? (
      <SymbolView
        name={finalSfSymbol}
        size={ds.iconSize[finalIconSize]}
        tintColor={finalIconColor}
      />
    ) : (
      <Icon
        name={finalIcon}
        color={finalIconColor}
        size={ds.iconSize[finalIconSize]}
      />
    )
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
        ...Platform.select({
          web: {
            marginRight: ds.spacing.sm,
          },
        }),
      },
      actionButton: {
        paddingHorizontal: ds.spacing.sm,
      },
      text: {
        ...ds.typography.heading,
      },
    }),
  (baseSize) => baseSize.toString(),
);
