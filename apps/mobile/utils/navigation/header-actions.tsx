import React from 'react';
import {Platform, View} from 'react-native';
import {IconButton} from 'react-native-paper';
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
type NativeVariant = NonNullable<NativeHeaderButtonItem['variant']>;

/**
 * App-level variant API.
 * Note: native-stack does not expose "clear" as a variant; "clear" means `variant` is omitted.
 */
export type HeaderButtonVariant = 'clear' | 'prominent';

/** SF Symbol name type derived from native-stack itself */
type IosSfSymbolName = Extract<
  NonNullable<NativeHeaderButtonItem['icon']>,
  {type: 'sfSymbol'}
>['name'];

/**
 * Cross-platform header action.
 *
 * iOS:
 * - rendered via `unstable_headerLeftItems/unstable_headerRightItems`
 * - uses SF Symbols
 *
 * Android/Web:
 * - rendered as Paper `IconButton`
 * - uses Material design icons
 */
export type HeaderAction = {
  key: string;
  label: string;

  onPress?: () => void;
  disabled?: boolean;

  /** iOS only: SF Symbol name */
  iosSymbol?: IosSfSymbolName;

  /** Android/Web: material icon name */
  icon?: string;

  /** Icon/text tint (iOS prominent tint when supported). */
  tintColor?: string;

  /** App-level variant. "clear" maps to native default (no variant). */
  variant?: HeaderButtonVariant;

  /** iOS only: button can share one container when using clear variant. */
  sharesBackground?: boolean;
};

export type HeaderActionsConfig = {
  left?: HeaderAction[];
  right?: HeaderAction[];
  headerLeftElement?: React.ReactNode;
  headerRightElement?: React.ReactNode;
};

function ActionsRow({actions}: {actions: HeaderAction[]}) {
  return (
    <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
      {actions.map((a) => (
        <IconButton
          key={a.key}
          icon={a.icon ?? 'dots-horizontal'}
          onPress={a.disabled || !a.onPress ? undefined : a.onPress}
          disabled={a.disabled}
          iconColor={a.tintColor}
          style={{margin: 0}}
          accessibilityLabel={a.label}
        />
      ))}
    </View>
  );
}

function toIOSHeaderItem(a: HeaderAction): NativeHeaderButtonItem {
  const press = a.onPress;
  const disabled = !!a.disabled;

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
  if (typeof a.sharesBackground === 'boolean')
    item.sharesBackground = a.sharesBackground;

  // Map app variant -> native variant.
  if (a.variant === 'prominent') {
    // Compile-time check: fails if installed native-stack doesn't support 'prominent'
    const nativeProminent: NativeVariant = 'prominent';
    item.variant = nativeProminent;
  }

  return item;
}

/**
 * Build cross-platform header options.
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
  if (Platform.OS === 'ios') {
    return {
      // Actions take precedence over custom elements (matches Android/Web)
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

      // native-stack types require a function callable both with and without props.
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
 * Imperative helper for screens with a `navigation` object.
 * Equivalent to `navigation.setOptions(getHeaderOptions(config))`.
 */
export function applyHeaderActions(
  navigation: NavigationLike,
  config: HeaderActionsConfig,
): void {
  navigation.setOptions(getHeaderOptions(config));
}

/** Clears both headerLeft/right and unstable header item APIs. */
export function clearHeaderActions(navigation: NavigationLike): void {
  navigation.setOptions({
    headerLeft: undefined,
    headerRight: undefined,
    unstable_headerLeftItems: undefined,
    unstable_headerRightItems: undefined,
  } satisfies Partial<NativeStackNavigationOptions>);
}
