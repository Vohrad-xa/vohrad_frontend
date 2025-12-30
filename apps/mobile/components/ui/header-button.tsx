import {Platform, Pressable, StyleSheet} from 'react-native';
import {Palette, type TokenName} from '@/constants/colors';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import type {RequiredIconProps, BaseViewProps} from '@/types';
import {Icon, AppIcons} from '@/utils';
import {makeStyleFactory} from '@/utils/style-factory';
import {ThemedText} from './themed-text';

const getReadableIconName = (iconPath: string): string => {
  const parts = iconPath.split('.');
  const name = parts[parts.length - 1];
  const withSpaces = name.replace(/([A-Z])/g, ' $1').trim();

  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1).toLowerCase();
};

type VariantConfig = {
  icon?: string;
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
        iconSize: 'lg',
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
        iconSize: 'lg',
      };
    case 'success':
      return {
        icon: AppIcons.status.success,
        color: Palette.green,
        iconSize: 'xxl',
      };
    case 'edit':
      return {
        text: 'Edit',
        color: Palette.white,
      };
    case 'add':
      return {
        icon: AppIcons.actions.add,
        color: theme.text,
        iconSize: 'lg',
      };
    case 'more':
      return {
        icon: AppIcons.ui.more,
        iconSize: 'lg',
        color: theme.text,
      };
    case 'back':
      return {
        icon: AppIcons.ui.back,
        color: theme.text,
        iconSize: 'lg',
      };
    case 'destructive':
      return {
        color: theme.destructive,
      };
    case 'menu':
      return {
        icon: AppIcons.ui.menu,
        iconSize: 'lg',
      };
    default:
      return {
        iconSize: Platform.OS === 'ios' ? 'xl' : 'lg',
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
  | 'more'
  | 'success'
  | 'back'
  | 'destructive'
  | 'menu';

export interface HeaderButtonProps
  extends
    Omit<RequiredIconProps, 'icon'>,
    Pick<BaseViewProps, 'style' | 'accessibilityLabel' | 'testID'> {
  onPress?: () => void;
  variant?: HeaderButtonVariant;
  icon?: string;
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
  testID,
  style,
}: HeaderButtonProps) => {
  const {theme, ds} = useTheme();
  const baseSize = Platform.select({
    ios: ds.spacing.xxl + ds.spacing.xs,
    default: ds.spacing.xxl + ds.spacing.md,
  });
  const styles = createStyles(ds, baseSize, theme);

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
        radius: baseSize / 2,
      }}
      style={[styles.button, style]}
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel ??
        (useText
          ? `${useText} button`
          : useIcon
            ? `${getReadableIconName(useIcon)} button`
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
  (ds: DSShape, baseSize: number, _theme: ThemeShape) =>
    StyleSheet.create({
      button: {
        minWidth: baseSize,
        minHeight: baseSize,
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
          web: {
            marginHorizontal: ds.spacing.sm,
          },
        }),
      },
    }),
  (ds, _baseSize, theme) => themeKey(theme, ds),
);
