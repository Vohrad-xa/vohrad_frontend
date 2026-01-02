import {Platform, Pressable, StyleSheet} from 'react-native';
import {Palette, type TokenName} from '@/constants/colors';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import type {RequiredIconProps, BaseViewProps} from '@/types';
import {Icon, AppIcons, type IconName} from '@/utils';
import {makeStyleFactory} from '@/utils/style-factory';
import {ThemedText} from './themed-text';

const getReadableIconName = (iconPath: string): string => {
  const parts = iconPath.split('.');
  const name = parts[parts.length - 1];
  const withSpaces = name.replace(/([A-Z])/g, ' $1').trim();

  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1).toLowerCase();
};

type VariantConfig = {
  icon?: IconName;
  text?: string;
  color?: string;
  iconSize?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
};

const getVariantConfig = (
  variant: HeaderButtonVariant | undefined,
  theme: ThemeShape,
): VariantConfig => {
  switch (variant) {
    case 'text':
      return {
        text: '',
        color: theme.text,
      };
    case 'close':
      return {
        icon: AppIcons.ui.close,
        color: theme.text,
      };
    case 'cancel':
      return {
        text: 'Cancel',
        color: theme.destructive,
      };
    case 'save':
      return {
        icon: AppIcons.actions.save,
        color: Palette.white,
      };
    case 'success':
      return {
        icon: AppIcons.status.success,
        color: Palette.green,
        iconSize: 'xxl',
      };
    case 'edit':
      return {
        icon: AppIcons.actions.edit,
        color: theme.text,
      };
    case 'add':
      return {
        icon: AppIcons.actions.add,
        color: theme.text,
      };
    case 'share':
      return {
        icon: AppIcons.actions.share,
        color: theme.text,
      };
    case 'delete':
      return {
        icon: AppIcons.actions.delete,
        color: theme.text,
      };
    case 'more':
      return {
        icon: AppIcons.ui.more,
        color: theme.text,
      };
    case 'back':
      return {
        icon: AppIcons.ui.back,
        color: theme.text,
      };
    case 'destructive':
      return {
        color: theme.destructive,
      };
    case 'menu':
      return {
        icon: AppIcons.ui.menu,
      };
    default:
      return {
        iconSize: 'lg',
        color: theme.text,
      };
  }
};

export type HeaderButtonVariant =
  | 'text'
  | 'close'
  | 'cancel'
  | 'save'
  | 'edit'
  | 'add'
  | 'share'
  | 'delete'
  | 'more'
  | 'success'
  | 'back'
  | 'destructive'
  | 'menu';

export interface HeaderButtonProps
  extends
    Omit<RequiredIconProps, 'icon'>,
    Pick<
      BaseViewProps,
      'style' | 'accessibilityLabel' | 'accessibilityHint' | 'testID'
    > {
  onPress?: () => void;
  variant?: HeaderButtonVariant;
  icon?: IconName;
  text?: string;
  textColor?: string;
  textColorToken?: TokenName;
  iconColor?: string;
  iconColorToken?: TokenName;
  iconSize?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  symbolType?: 'monochrome' | 'hierarchical' | 'palette' | 'multicolor';
  symbolColorTokens?: TokenName[];
}

export const HeaderButton = ({
  variant,
  icon,
  text,
  onPress,
  iconColor,
  iconColorToken,
  textColor,
  textColorToken,
  iconSize,
  symbolType,
  symbolColorTokens,
  accessibilityLabel,
  accessibilityHint,
  testID,
  style,
}: HeaderButtonProps) => {
  const {theme, ds} = useTheme();
  const styles = createStyles(ds, theme);
  const isDisabled = !onPress;
  const isTextLike = variant === 'text' || variant === 'cancel';

  const variantConfig = getVariantConfig(variant, theme);

  // Variant config as defaults
  const useIcon = icon ?? variantConfig.icon;
  const useText = text ?? variantConfig.text;
  const useIconSize = iconSize ?? variantConfig.iconSize ?? 'lg';
  const useIconColorToken = iconColor ? undefined : iconColorToken;
  const useIconColor =
    iconColor ?? (useIconColorToken ? undefined : variantConfig.color);
  const useTextColor =
    textColor ??
    (textColorToken ? theme[textColorToken as TokenName] : variantConfig.color);

  // Button content based on icon or text
  const buttonContent = useIcon ? (
    <Icon
      name={useIcon}
      color={useIconColor}
      colorToken={useIconColorToken}
      size={ds.iconSize[useIconSize]}
      symbolType={symbolType}
      symbolColorTokens={symbolColorTokens}
    />
  ) : useText ? (
    <ThemedText variant="body" style={{color: useTextColor}}>
      {useText}
    </ThemedText>
  ) : null;

  return (
    <Pressable
      android_ripple={{
        foreground: true,
        borderless: true,
        color: theme.ripple,
      }}
      style={[
        styles.button,
        isTextLike && styles.buttonTextPadding,
        // isDisabled && styles.buttonDisabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel ??
        (useText
          ? `${useText} button`
          : useIcon
            ? `${getReadableIconName(useIcon)} button`
            : 'button')
      }
      accessibilityHint={accessibilityHint}
      accessibilityState={{disabled: isDisabled}}
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
    >
      {buttonContent}
    </Pressable>
  );
};

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      button: {
        minWidth: Platform.select({
          ios: ds.spacing.xxl + ds.spacing.xs,
          default: ds.spacing.xxl + ds.spacing.sm,
        }),
        minHeight: ds.spacing.xxl,
        justifyContent: 'center',
        alignItems: 'center',
      },

      buttonTextPadding: {
        paddingHorizontal: ds.spacing.sm,
        backgroundColor: Platform.OS !== 'ios' ? theme.ripple : undefined,
        borderRadius: ds.borderRadius.full,
      },

      // buttonDisabled: {
      //   opacity: 0.4,
      // },
    }),
  (ds, theme) => themeKey(theme, ds),
);
