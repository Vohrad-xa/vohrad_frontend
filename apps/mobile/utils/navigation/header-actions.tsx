import React from 'react';
import {Platform, View, StyleSheet} from 'react-native';
import {IconButton, Badge} from 'react-native-paper';
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
type NativeHeaderMenuItem = Extract<NativeStackHeaderItem, {type: 'menu'}>;
type HeaderButtonVariant = NativeHeaderButtonItem['variant'];
type HeaderButtonLabelStyle = NativeHeaderButtonItem['labelStyle'];
type HeaderButtonBadge = NativeHeaderButtonItem['badge'];
type HeaderMenuConfig = NativeHeaderMenuItem['menu'];

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

  /** iOS only. Allow background sharing with adjacent items. */
  sharesBackground?: boolean;

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

/**
 * Menu action.
 *
 * iOS:
 * - rendered as a real native menu via `unstable_header*Items`
 *
 * Android/Web:
 * - rendered as a normal IconButton (same slot),
 *   and you control what happens via `onPress` (Paper Menu, bottom sheet, etc.)
 *
 * @example
 * {
 *   type: 'menu',
 *   key: 'options',
 *   label: 'Options',
 *   iosSymbol: 'ellipsis.circle',
 *   icon: 'dots-vertical',
 *   menu: {
 *     title: 'Actions',
 *     items: [{type: 'action', label: 'Export', onPress: () => {}}]
 *   },
 *   onPress: () => setMenuOpen(true), // Android/Web
 * }
 */
export type HeaderMenuAction = {
  type: 'menu';
  key: string;
  label: string;

  /** iOS: SF Symbol name like 'ellipsis.circle' */
  iosSymbol?: IosSfSymbolName;

  /** Android/Web: Material icon name like 'dots-vertical' */
  icon?: string;

  tintColor?: string;

  /** iOS native menu config */
  menu: HeaderMenuConfig;

  /** iOS only */
  changesSelectionAsPrimaryAction?: boolean;

  /** Android/Web fallback behavior */
  onPress?: () => void;
  disabled?: boolean;

  accessibilityLabel?: string;
  accessibilityHint?: string;
};

export type HeaderAction = HeaderButtonAction | HeaderMenuAction;

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

const styles = StyleSheet.create({
  row: {flexDirection: 'row', alignItems: 'center', gap: 4},
  iconBtn: {margin: 0},
  selected: {opacity: 0.5},
  badgeWrap: {position: 'relative'},
  badge: {position: 'absolute', top: 4, right: 4},
});

/**
 * Dev-time safety checks:
 * - keys must be unique across left/right (and within each).
 * - buttons without onPress must be explicitly disabled.
 * - menus on Android/Web must have onPress or be explicitly disabled.
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

      // Max-safety: on Android/Web, a "menu" is just a button, so it must have onPress or be disabled.
      if (
        Platform.OS !== 'ios' &&
        a.type === 'menu' &&
        !a.onPress &&
        !a.disabled
      ) {
        throw new Error(
          `[header-actions] Menu "${a.key}" at ${where} has no onPress for Android/Web but disabled is not set. Set disabled: true (or provide onPress).`,
        );
      }
    });
  };

  checkSide(left, 'left');
  checkSide(right, 'right');
}

function ActionsRow({actions}: {actions: HeaderAction[]}) {
  return (
    <View style={styles.row}>
      {actions.map((a) => {
        // Android/Web rendering path (ActionsRow is only used off-iOS in getHeaderOptions).
        if (a.type === 'menu') {
          const disabled = !!a.disabled || !a.onPress;

          return (
            <IconButton
              key={a.key}
              icon={a.icon ?? 'dots-vertical'}
              onPress={disabled ? undefined : a.onPress}
              disabled={disabled}
              iconColor={a.tintColor}
              style={styles.iconBtn}
              accessibilityLabel={a.accessibilityLabel ?? a.label}
              accessibilityHint={a.accessibilityHint}
            />
          );
        }

        // Button: standard handling
        const disabled = !!a.disabled || !a.onPress;

        const btn = (
          <IconButton
            icon={a.icon ?? 'dots-horizontal'}
            onPress={disabled ? undefined : a.onPress}
            disabled={disabled}
            iconColor={a.tintColor}
            style={[styles.iconBtn, a.selected && styles.selected]}
            accessibilityLabel={a.accessibilityLabel ?? a.label}
            accessibilityHint={a.accessibilityHint}
          />
        );

        if (!a.badge) {
          return <React.Fragment key={a.key}>{btn}</React.Fragment>;
        }

        return (
          <View key={a.key} style={styles.badgeWrap}>
            {btn}
            <Badge
              visible
              size={18}
              style={[
                styles.badge,
                a.badge.style?.backgroundColor
                  ? {backgroundColor: a.badge.style.backgroundColor}
                  : undefined,
              ]}
            >
              {String(a.badge.value)}
            </Badge>
          </View>
        );
      })}
    </View>
  );
}

function toIOSHeaderItem(a: HeaderAction): NativeStackHeaderItem {
  if (a.type === 'menu') {
    const item: NativeHeaderMenuItem = {
      type: 'menu',
      label: a.label,
      menu: a.menu,
    };

    if (a.iosSymbol) item.icon = {type: 'sfSymbol', name: a.iosSymbol};
    if (a.tintColor) item.tintColor = a.tintColor;
    if (a.changesSelectionAsPrimaryAction)
      item.changesSelectionAsPrimaryAction = a.changesSelectionAsPrimaryAction;
    if (a.accessibilityLabel) item.accessibilityLabel = a.accessibilityLabel;
    if (a.accessibilityHint) item.accessibilityHint = a.accessibilityHint;

    // Note: Android/Web fallback uses onPress/disabled. iOS menu ignores them.
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
  if (a.badge) item.badge = a.badge;
  if (typeof a.sharesBackground === 'boolean')
    item.sharesBackground = a.sharesBackground;
  if (a.accessibilityLabel) item.accessibilityLabel = a.accessibilityLabel;
  if (a.accessibilityHint) item.accessibilityHint = a.accessibilityHint;

  return item;
}

/**
 * Build platform-appropriate header options from actions.
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

  if (Platform.OS === 'ios') {
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
