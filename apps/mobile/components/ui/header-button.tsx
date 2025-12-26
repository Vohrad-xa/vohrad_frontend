import type {FC} from 'react';
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
    case 'action':
      return {
        color: theme.accentBlue,
      };
    case 'destructive':
      return {
        color: theme.destructive,
      };
    case 'menu':
      return {
        icon: AppIcons.ui.menu,
        iconSize: 'lg',
        color: theme.text,
      };
    default:
      return {
        iconSize: Platform.OS === 'ios' ? 'xl' : 'md',
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
  | 'action'
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
  symbolType,
  symbolColorTokens,
  accessibilityLabel,
  testID,
  style,
}) => {
  const {theme, ds} = useTheme();
  const baseSize = Platform.select({
    ios: ds.spacing.xxl + ds.spacing.xs,
    default: ds.spacing.xxl,
  });
  const styles = createStyles(ds, baseSize, theme);

  const variantConfig = getVariantConfig(variant, theme);

  // Variant config as defaults
  const useIcon = icon ?? variantConfig.icon;
  const useText = text ?? variantConfig.text;
  const useIconSize = iconSize ?? variantConfig.iconSize ?? 'lg';
  const useIconColor =
    iconColor ??
    (iconColorToken ? theme[iconColorToken as TokenName] : variantConfig.color);
  const useTextColor =
    textColor ??
    (textColorToken ? theme[textColorToken as TokenName] : variantConfig.color);

  // Button content based on icon or text
  const buttonContent = useIcon ? (
    <Icon
      name={useIcon}
      colorToken={useIconColor as TokenName}
      size={ds.iconSize[useIconSize]}
      symbolType={symbolType}
      symbolColorTokens={symbolColorTokens}
    />
  ) : useText ? (
    <ThemedText variant="body" style={{color: useTextColor}}>
      {useText}
    </ThemedText>
  ) : null;

  // styling based on variant
  const isActionButton =
    variant === 'edit' || variant === 'cancel' || variant === 'text';
  const isSaveButton = variant === 'save' || variant === 'edit';
  const isMenuButton = variant === 'menu';
  return (
    <Pressable
      android_ripple={{
        foreground: true,
        borderless: true,
        color: theme.muted,
        radius: baseSize / 2,
      }}
      style={[
        styles.button,
        isActionButton ? styles.actionButton : null,
        isSaveButton ? styles.saveButton : null,
        isMenuButton ? styles.menuButton : null,
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
      testID={testID}
      onPress={onPress}
      disabled={!onPress}
    >
      {buttonContent}
    </Pressable>
  );
};

const createStyles = makeStyleFactory(
  (ds: DSShape, baseSize: number, theme: ThemeShape) =>
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
        letterSpacing: 1,
      },
      text: {
        ...ds.typography.heading,
      },
      saveButton: {
        backgroundColor: theme.accentBlue,
        borderRadius: ds.borderRadius.full,
      },
      menuButton: {
        ...Platform.select({
          android: {
            marginRight: ds.spacing.xxl,
            backgroundColor: theme.glassTint,
            borderRadius: ds.borderRadius.full,
          },
        }),
      },
    }),
  (ds, _baseSize, theme) => themeKey(theme, ds),
);
