import {Platform, Pressable, StyleSheet} from 'react-native';
import {
  themeKey,
  type DSShape,
  type ThemeShape,
  Palette,
  type TokenName,
} from '@/constants';
import {useTheme} from '@/providers';
import type {RequiredIconProps, BaseViewProps} from '@/types';
import {Icon, AppIcons, type IconName, makeStyleFactory} from '@/utils';
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
      };
    case 'cancel':
      return {
        text: 'Cancel',
        color: theme.destructive,
      };
    case 'save':
      return {
        icon: AppIcons.actions.save,
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
      };
    case 'add':
      return {
        icon: AppIcons.actions.add,
      };
    case 'share':
      return {
        icon: AppIcons.actions.share,
      };
    case 'delete':
      return {
        icon: AppIcons.actions.delete,
      };
    case 'more':
      return {
        icon: AppIcons.ui.more,
      };
    case 'back':
      return {
        icon: AppIcons.ui.back,
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
        iconSize: 'xl',
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
  isGrouped?: boolean;
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
  isGrouped,
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
    <ThemedText
      variant="body"
      style={{color: useTextColor, fontWeight: ds.fontWeight.medium}}
    >
      {useText}
    </ThemedText>
  ) : null;

  return (
    <Pressable
      android_ripple={{
        foreground: true,
        borderless: true,
      }}
      style={[
        styles.button,
        isGrouped && styles.groupedButton,
        isTextLike && styles.textButton,
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
          ios: ds.spacing.xxl,
          default: ds.spacing.xxl + ds.spacing.sm,
        }),
        minHeight: ds.spacing.xxl,
        justifyContent: 'center',
        alignItems: 'center',
      },

      textButton: {
        paddingHorizontal: ds.spacing.md,
        backgroundColor: Platform.OS !== 'ios' ? theme.ripple : undefined,
        borderRadius: ds.borderRadius.full,
      },
      groupedButton: {
        marginHorizontal: Platform.OS === 'ios' ? ds.spacing.xs : 0,
      },

      // buttonDisabled: {
      //   opacity: 0.4,
      // },
    }),
  (ds, theme) => themeKey(theme, ds),
);
