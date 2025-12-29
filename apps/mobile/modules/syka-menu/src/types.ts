import type {
  ColorValue,
  processColor,
  StyleProp,
  ViewStyle,
} from 'react-native';
import type * as React from 'react';

export type NativeActionEvent = {
  nativeEvent: {
    /**
     * Action id from the selected menu item.
     */
    event: string;
  };
};

/**
 * Per-item behavior flags.
 */
type MenuAttributes = {
  /**
   * Marks the item as destructive (red).
   */
  destructive?: boolean;
  /**
   * Disables and dims the item.
   */
  disabled?: boolean;
  /**
   * Hides the item from the menu.
   */
  hidden?: boolean;
  /**
   * Keeps the menu open after selection (Android, iOS 16+).
   */
  keepsMenuPresented?: boolean;
};

/**
 * Checkmark state for toggle-style items.
 */
type MenuState = 'off' | 'on' | 'mixed';

/**
 * Action item definition for SykaMenuView.
 *
 * - Nested `subactions` render a submenu.
 */
export type SykaMenuAction = {
  /**
   * Optional id emitted via `onPressAction`.
   */
  id?: string;
  /**
   * Primary label shown in the menu.
   */
  title: string;
  /**
   * Not implemented yet; ignored on both platforms.
   */
  separator?: boolean;
  /**
   * Android only. Overrides item text color unless destructive/disabled.
   * Ignored on iOS.
   */
  androidTitleColor?: number | ColorValue;
  /**
   * Secondary line below the title (Android, iOS 15+).
   */
  subtitle?: string;
  /**
   * Behavior flags (destructive, disabled, hidden, keepsMenuPresented).
   */
  attributes?: MenuAttributes;
  /**
   * Checkmark state. Android supports `on`/`off`; `mixed` is iOS only.
   */
  state?: MenuState;
  /**
   * Icon name. iOS uses SF Symbol or asset; Android uses a Material icon name
   * (e.g. `outlined.Info`).
   */
  image?: string;
  /**
   * Icon tint color.
   */
  imageColor?: number | ColorValue;
  /**
   * Submenu options.
   *
   * - Only applies when `subactions` are present.
   */
  menuOptions?: {
    /**
     * iOS 15+. Enables single-selection behavior for submenu items.
     */
    singleSelection?: boolean;
    /**
     * iOS only. Marks the submenu as destructive.
     * Android uses this to tint the submenu trigger title.
     */
    destructive?: boolean;
    /**
     * Displays submenu items inline (Android + iOS).
     */
    displayInline?: boolean;
  };
  /**
   * Nested actions. When set, this item becomes a submenu trigger.
   */
  subactions?: SykaMenuAction[];
  /**
   * iOS 16+ only. Preferred size for submenu elements.
   */
  preferredElementSize?: 'small' | 'medium' | 'large';
};

/**
 * Props for SykaMenuView.
 *
 * - Provide `actions` to define the menu content.
 */
type MenuComponentPropsBase = {
  /**
   * Wrapper style for the menu trigger view.
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Called when a leaf action is selected.
   */
  onPressAction?: ({nativeEvent}: NativeActionEvent) => void;
  /**
   * Fired after the menu is dismissed.
   */
  onCloseMenu?: () => void;
  /**
   * Fired when the menu is about to open.
   */
  onOpenMenu?: () => void;
  /**
   * Menu entries; nested `subactions` create submenus.
   */
  actions: SykaMenuAction[];
  /**
   * Menu title (Android + iOS).
   *
   * - Android renders a top-level header.
   */
  title?: string;
  /**
   * Android only. Anchors the popup to the right edge.
   */
  isAnchoredToRight?: boolean;
  /**
   * If true, opens on long-press instead of single tap.
   */
  shouldOpenOnLongPress?: boolean;
  /**
   * iOS only. Forces light/dark menu appearance.
   */
  themeVariant?: string;
  /**
   * Expands the touch target for the trigger view.
   */
  hitSlop?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  /**
   * E2E identifier.
   */
  testID?: string;
  /**
   * Screen reader label for the trigger view.
   */
  accessibilityLabel?: string;
  /**
   * Screen reader hint for the trigger view.
   *
   * - On Android, also exposed as a tooltip when available.
   */
  accessibilityHint?: string;
};

export type MenuComponentProps =
  React.PropsWithChildren<MenuComponentPropsBase>;

export type MenuComponentRef = {
  /**
   * Imperatively open the menu.
   */
  show: () => void;
};

export type ProcessedMenuAction = Omit<
  SykaMenuAction,
  'imageColor' | 'androidTitleColor' | 'subactions'
> & {
  imageColor: ReturnType<typeof processColor>;
  titleColor: ReturnType<typeof processColor>;
  subactions?: ProcessedMenuAction[];
};

export type NativeMenuComponentProps = {
  style?: StyleProp<ViewStyle>;
  onPressAction?: ({nativeEvent}: NativeActionEvent) => void;
  onCloseMenu?: () => void;
  onOpenMenu?: () => void;
  actions: ProcessedMenuAction[];
  actionsHash: string;
  title?: string;
  hitSlop?: MenuComponentProps['hitSlop'];
  isAnchoredToRight?: boolean;
  shouldOpenOnLongPress?: boolean;
  themeVariant?: string;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  ref?: React.ForwardedRef<MenuComponentRef>;
};
