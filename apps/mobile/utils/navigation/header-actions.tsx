import React from 'react';
import {Platform, View, StyleSheet} from 'react-native';
import {IconButton, Badge, Tooltip} from 'react-native-paper';
import {Palette} from '@/constants';
import {useTheme} from '@/providers/theme-provider';
import type {ParamListBase} from '@react-navigation/native';
import type {
  NativeStackHeaderItem,
  NativeStackHeaderItemProps,
  NativeStackNavigationOptions,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';

export type NavigationLike = Pick<
  NativeStackNavigationProp<ParamListBase>,
  'setOptions'
>;

type NativeHeaderButtonItem = Extract<NativeStackHeaderItem, {type: 'button'}>;
type HeaderButtonVariant = NativeHeaderButtonItem['variant'];
type HeaderButtonLabelStyle = NativeHeaderButtonItem['labelStyle'];
type HeaderButtonBadge = NativeHeaderButtonItem['badge'];
type NativeHeaderCustomItem = Extract<NativeStackHeaderItem, {type: 'custom'}>;

type IosSfSymbolName = Extract<
  NonNullable<NativeHeaderButtonItem['icon']>,
  {type: 'sfSymbol'}
>['name'];

/**
 * Button action.
 *
 * @example
 * {
 *   type: 'button',
 *   key: 'save',
 *   label: 'Save',
 *   iosSymbol: 'checkmark',
 *   icon: 'check',
 *   variant: 'done',
 *   onPress: () => save(),
 * }
 */
export type HeaderButtonAction = {
  type: 'button';
  key: string;
  label: string;

  onPress?: () => void;
  disabled?: boolean;

  /** iOS: SF Symbol name like 'star.fill' */
  iosSymbol?: IosSfSymbolName;

  /** Android/Web: Material icon name like 'star' */
  icon?: string;

  /** Icon and text tint color */
  tintColor?: string;

  /** Button style: 'plain' | 'done' | 'prominent' (iOS only) */
  variant?: HeaderButtonVariant;

  /**
   * iOS only. Label font customization: fontFamily, fontSize, fontWeight, color.
   * Note: color only works when tintColor is NOT set (iOS limitation).
   */
  labelStyle?: HeaderButtonLabelStyle;

  /** iOS only. Fixed width in points. Useful for icon+label buttons. */
  width?: number;

  /** Selected/active state. iOS native, Android shows as 50% opacity. */
  selected?: boolean;

  /** iOS 26+ only. Allow background sharing with adjacent items. */
  sharesBackground?: boolean;

  /** iOS 26+ only. Hides the shared background an item may display. */
  hidesSharedBackground?: boolean;

  /** Screen reader label override. Defaults to 'label' if not provided. */
  accessibilityLabel?: string;

  /** Screen reader hint for action description. */
  accessibilityHint?: string;

  /**
   * Notification badge. iOS 26+ native, Android via react-native-paper.
   * @example {value: 5, style: {backgroundColor: 'red'}}
   */
  badge?: HeaderButtonBadge;
};

export type HeaderCustomAction = {
  type: 'custom';
  key: string;
  element: React.ReactElement;

  /** iOS 26+ only. Hides the shared background for this custom item. */
  hidesSharedBackground?: boolean;
};

export type HeaderAction = HeaderButtonAction | HeaderCustomAction;

export type HeaderActionsConfig = {
  /** Left-side actions */
  left?: HeaderAction[];

  /** Right-side actions */
  right?: HeaderAction[];

  /** Custom React element for left side (used only if 'left' is empty) */
  headerLeftElement?: React.ReactNode;

  /** Custom React element for right side (used only if 'right' is empty) */
  headerRightElement?: React.ReactNode;
};

/** Default badge colors applied on both platforms when no style override is given. */

const styles = StyleSheet.create({
  row: {flexDirection: 'row', alignItems: 'center'},
  selected: {opacity: 0.5},
  badgeWrap: {position: 'relative'},
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
});

const BADGE_STYLE = {
  color: Palette.white,
  backgroundColor: Palette.orange,
} as const;

/**
 * Dev-time safety checks:
 * - keys must be unique across left/right (and within each).
 * - buttons without onPress must be explicitly disabled.
 *
 * Throws in __DEV__ to fail fast.
 */
function assertValidActions(left?: HeaderAction[], right?: HeaderAction[]) {
  if (!__DEV__) return;

  const seen = new Map<string, string>();

  const checkSide = (
    arr: HeaderAction[] | undefined,
    side: 'left' | 'right',
  ) => {
    arr?.forEach((a, idx) => {
      const where = `${side}[${idx}]`;

      if (!a.key) {
        throw new Error(`[header-actions] Missing key at ${where}.`);
      }

      const prev = seen.get(a.key);
      if (prev) {
        throw new Error(
          `[header-actions] Duplicate key "${a.key}" used in ${where} and ${prev}. Keys must be unique across left/right.`,
        );
      }
      seen.set(a.key, where);

      if (a.type === 'button' && !a.onPress && !a.disabled) {
        throw new Error(
          `[header-actions] Button "${a.key}" at ${where} has no onPress but disabled is not set. Set disabled: true (or provide onPress).`,
        );
      }
    });
  };

  checkSide(left, 'left');
  checkSide(right, 'right');
}

function ActionsRow({actions}: {actions: HeaderAction[]}) {
  const {theme} = useTheme();

  return (
    <View style={styles.row}>
      {actions.map((a) => {
        if (a.type === 'custom') {
          return <React.Fragment key={a.key}>{a.element}</React.Fragment>;
        }

        // Button: standard handling
        const disabled = !!a.disabled || !a.onPress;

        const btn = (
          <IconButton
            icon={a.icon ?? 'dots-vertical'}
            onPress={disabled ? undefined : a.onPress}
            disabled={disabled}
            iconColor={a.tintColor ?? theme.icon}
            style={[a.selected && styles.selected]}
            accessibilityLabel={a.accessibilityLabel ?? a.label}
            accessibilityHint={a.accessibilityHint}
          />
        );

        if (!a.badge) {
          return (
            <Tooltip key={a.key} title={a.label}>
              {btn}
            </Tooltip>
          );
        }

        return (
          <Tooltip key={a.key} title={a.label}>
            <View style={styles.badgeWrap}>
              {btn}
              <Badge
                visible
                size={18}
                style={[
                  styles.badge,
                  {
                    color: a.badge.style?.color ?? BADGE_STYLE.color,
                    backgroundColor:
                      a.badge.style?.backgroundColor ??
                      BADGE_STYLE.backgroundColor,
                  },
                ]}
              >
                {String(a.badge.value)}
              </Badge>
            </View>
          </Tooltip>
        );
      })}
    </View>
  );
}

function toIOSHeaderItem(a: HeaderAction): NativeStackHeaderItem {
  if (a.type === 'custom') {
    const item: NativeHeaderCustomItem = {
      type: 'custom',
      element: a.element,
    };

    if (typeof a.hidesSharedBackground === 'boolean')
      item.hidesSharedBackground = a.hidesSharedBackground;

    return item;
  }

  const press = a.onPress;
  const disabled = !!a.disabled || !press;

  const item: NativeHeaderButtonItem = {
    type: 'button',
    label: a.label,
    disabled,
    onPress: () => {
      if (disabled) return;
      press?.();
    },
  };

  if (a.iosSymbol) item.icon = {type: 'sfSymbol', name: a.iosSymbol};
  if (a.tintColor) item.tintColor = a.tintColor;
  if (a.variant) item.variant = a.variant;
  if (a.labelStyle) item.labelStyle = a.labelStyle;
  if (a.width !== undefined) item.width = a.width;
  if (a.selected !== undefined) item.selected = a.selected;
  if (a.badge) {
    item.badge = {
      ...a.badge,
      style: {
        ...BADGE_STYLE,
        ...a.badge.style,
      },
    };
  }
  if (typeof a.sharesBackground === 'boolean')
    item.sharesBackground = a.sharesBackground;
  if (typeof a.hidesSharedBackground === 'boolean')
    item.hidesSharedBackground = a.hidesSharedBackground;
  if (a.accessibilityLabel) item.accessibilityLabel = a.accessibilityLabel;
  if (a.accessibilityHint) item.accessibilityHint = a.accessibilityHint;

  return item;
}

/**
 * Whether the native unstable header items API is available.
 * Requires iOS 26+ for full support (badges, shared backgrounds, etc.).
 * Falls back to React-rendered ActionsRow on older iOS and Android/Web.
 */
const CHECK_IOS_26 =
  Platform.OS === 'ios' &&
  parseInt(String(Platform.Version).split('.')[0] ?? '0', 10) >= 26;

/**
 * Build platform-appropriate header options from actions.
 *
 * - iOS 26+: native bar button items via `unstable_header*Items`.
 * - Older iOS / Android / Web: React-rendered `ActionsRow` via `headerLeft`/`headerRight`.
 *
 * Works with:
 * - `<Stack.Screen options={getHeaderOptions(config)} />`
 * - `navigation.setOptions(getHeaderOptions(config))`
 */
export function getHeaderOptions({
  left,
  right,
  headerLeftElement,
  headerRightElement,
}: HeaderActionsConfig): Partial<NativeStackNavigationOptions> {
  assertValidActions(left, right);

  if (CHECK_IOS_26) {
    return {
      headerLeft: left?.length
        ? undefined
        : headerLeftElement
          ? () => headerLeftElement
          : undefined,

      headerRight: right?.length
        ? undefined
        : headerRightElement
          ? () => headerRightElement
          : undefined,

      unstable_headerLeftItems: left?.length
        ? (_props?: NativeStackHeaderItemProps) => left.map(toIOSHeaderItem)
        : undefined,

      unstable_headerRightItems: right?.length
        ? (_props?: NativeStackHeaderItemProps) => right.map(toIOSHeaderItem)
        : undefined,
    };
  }

  return {
    unstable_headerLeftItems: undefined,
    unstable_headerRightItems: undefined,

    headerLeft: left?.length
      ? () => <ActionsRow actions={left} />
      : headerLeftElement
        ? () => headerLeftElement
        : undefined,

    headerRight: right?.length
      ? () => <ActionsRow actions={right} />
      : headerRightElement
        ? () => headerRightElement
        : undefined,
  };
}

/**
 * Shorthand for navigation.setOptions(getHeaderOptions(config)).
 */
export function applyHeaderActions(
  navigation: NavigationLike,
  config: HeaderActionsConfig,
): void {
  navigation.setOptions(getHeaderOptions(config));
}

/** Remove all header actions and custom elements. */
export function clearHeaderActions(navigation: NavigationLike): void {
  navigation.setOptions({
    headerLeft: undefined,
    headerRight: undefined,
    unstable_headerLeftItems: undefined,
    unstable_headerRightItems: undefined,
  } satisfies Partial<NativeStackNavigationOptions>);
}
