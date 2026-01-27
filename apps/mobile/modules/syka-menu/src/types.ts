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
   * Keeps the menu open after selection (iOS 16+).
   */
  keepsMenuPresented?: boolean;
};

/**
 * Checkmark state for toggle-style items.
 */
type MenuState = 'off' | 'on' | 'mixed';

type SykaMenuSeparatorAction = {
  /**
   * Inserts a divider.
   *
   * - iOS 15+: native separators.
   */
  separator: true;
  title?: never;
};

/**
 * Action item definition for SykaMenuView.
 *
 * - Nested `subactions` render a submenu.
 */
export type SykaMenuAction =
  | {
      /**
       * Optional id emitted via `onPressAction`.
       */
      id?: string;
      /**
       * Primary label shown in the menu.
       */
      title: string;
      /**
       * When set, this item becomes a divider.
       */
      separator?: never;
      /**
       * Android only. Overrides item text color unless destructive/disabled.
       */
      titleColor?: number | ColorValue;
      /**
       * iOS 15+ only. Secondary line below the title.
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
       * Icon name. iOS uses SF Symbol or asset; Android uses drawable resource name.
       */
      image?: string;
      /**
       * Icon tint color.
       */
      imageColor?: number | ColorValue;
      /**
       * iOS submenu options (ignored on Android).
       *
       * - Only applies when `subactions` are present.
       */
      menuOptions?: {
        /**
         * iOS 15+. Enables single-selection behavior for submenu items.
         */
        singleSelection?: boolean;
        /**
         * iOS only. Marks the submenu title as destructive.
         */
        destructive?: boolean;
        /**
         * iOS only. Displays submenu items inline.
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
    }
  | SykaMenuSeparatorAction;

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
   * Menu title (iOS only).
   */
  title?: string;
  /**
   * Default title color for menu items on Android.
   *
   * - Applies to every menu item (including submenu triggers).
   * - Omit to keep the platform default text colors.
   * - Submenu trigger titles default to the Android accent when omitted.
   * - Ignored on iOS; destructive/disabled colors take precedence.
   */
  menuItemTextColor?: ColorValue;
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

export type ProcessedMenuAction = {
  id?: string;
  title: string;
  separator?: boolean;
  titleColor: ReturnType<typeof processColor>;
  subtitle?: string;
  attributes?: MenuAttributes;
  state?: MenuState;
  image?: string;
  imageColor: ReturnType<typeof processColor>;
  menuOptions?: {
    singleSelection?: boolean;
    destructive?: boolean;
    displayInline?: boolean;
  };
  subactions?: ProcessedMenuAction[];
  preferredElementSize?: 'small' | 'medium' | 'large';
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
