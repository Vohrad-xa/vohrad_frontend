import {requireNativeView} from 'expo';
import {type ViewEvent} from '../../types';
import {createViewModifierEventListener} from '../modifiers/utils';
import {type CommonViewModifierProps} from '../types';
import {type ModifierSwipeAction} from '../modifiers';

const ListNativeView: React.ComponentType<NativeListProps> =
  requireNativeView<NativeListProps>('SykamoreUi', 'ListView');

function transformListProps(
  props: Omit<ListProps, 'children'>,
): Omit<NativeListProps, 'children'> {
  const {modifiers, onSwipeAction, onRefresh, ...restProps} = props;
  return {
    modifiers,
    ...(modifiers ? createViewModifierEventListener(modifiers) : undefined),
    ...restProps,
    onDeleteItem: ({nativeEvent: {index}}) => props?.onDeleteItem?.(index),
    onMoveItem: ({nativeEvent: {from, to}}) => props?.onMoveItem?.(from, to),
    onSelectionChange: ({nativeEvent: {selection}}) =>
      props?.onSelectionChange?.(selection),
    onSwipeAction: ({nativeEvent: {actionId, label}}) =>
      onSwipeAction?.(actionId, label),
    onRefresh: () => onRefresh?.(),
  };
}

export type ListStyle =
  | 'automatic'
  | 'plain'
  | 'inset'
  | 'insetGrouped'
  | 'grouped'
  | 'sidebar';

/** Selection behavior for the list */
export type SelectionMode = 'multiple' | 'single' | 'none';

/** Visibility settings for separators */
export type SeparatorVisibility = 'automatic' | 'visible' | 'hidden';

/** Insets applied to each row */
export interface RowInsets {
  top?: number;
  bottom?: number;
  leading?: number;
  trailing?: number;
}

/** Swipe actions configuration for an edge */
export interface SwipeActionsConfig {
  actions: ModifierSwipeAction[];
  allowsFullSwipe?: boolean;
}

export interface ListProps extends CommonViewModifierProps {
  /** SwiftUI list style (default: 'automatic') */
  listStyle?: ListStyle;
  /** Allow selection of list items */
  selectEnabled?: boolean;
  /** Selection behavior ('multiple' by default) */
  selectionMode?: SelectionMode;
  /** Enable reordering of list items */
  moveEnabled?: boolean;
  /** Allow deletion of list items */
  deleteEnabled?: boolean;
  /** Make the list scrollable */
  scrollEnabled?: boolean;
  /** Enable SwiftUI edit mode */
  editModeEnabled?: boolean;
  /** Enable pull-to-refresh (iOS 15.0+) */
  refreshEnabled?: boolean;
  /** Control refresh indicator visibility; set to true while fetching and false to end */
  refreshing?: boolean;
  /** Show or hide scroll indicators (iOS 16.0+) */
  showScrollIndicators?: boolean;

  /** Control row separator visibility (iOS 15.0+) */
  rowSeparatorVisibility?: SeparatorVisibility;
  /** Control section separator visibility (iOS 15.0+) */
  sectionSeparatorVisibility?: SeparatorVisibility;
  /** Tint color for row separators (iOS 15.0+) */
  rowSeparatorTint?: string;
  /** Tint color for section separators (iOS 15.0+) */
  sectionSeparatorTint?: string;

  /** Apply consistent insets to all rows (iOS 15.0+) */
  rowInsets?: RowInsets;
  /** Apply a background color to all rows (iOS 15.0+) */
  rowBackground?: string;
  /** Spacing between rows (iOS 16.0+) */
  rowSpacing?: number;
  /** Spacing between sections (iOS 17.0+) */
  sectionSpacing?: number;
  /** Hide system scroll content background so you can style via modifiers (iOS 16.0+) */
  hideScrollContentBackground?: boolean;
  /** Dismiss keyboard on scroll (iOS 16.0+) */
  scrollDismissesKeyboard?: boolean;

  /** Leading edge swipe actions (iOS 15.0+) */
  leadingSwipeActions?: SwipeActionsConfig;
  /** Trailing edge swipe actions (iOS 15.0+) */
  trailingSwipeActions?: SwipeActionsConfig;
  /** Children elements rendered inside the list */
  children: React.ReactNode;
  /** Callback when item is deleted */
  onDeleteItem?: (index: number) => void;
  /** Callback when item is moved */
  onMoveItem?: (from: number, to: number) => void;
  /** Callback when selection changes */
  onSelectionChange?: (selection: number[]) => void;
  /** Callback when swipe action is triggered */
  onSwipeAction?: (actionId: string, label: string) => void;
  /** Callback when pull-to-refresh is triggered */
  onRefresh?: () => void;
}

type DeleteItemEvent = ViewEvent<'onDeleteItem', {index: number}>;
type MoveItemEvent = ViewEvent<'onMoveItem', {from: number; to: number}>;
type SelectItemEvent = ViewEvent<'onSelectionChange', {selection: number[]}>;
type SwipeActionEvent = ViewEvent<
  'onSwipeAction',
  {actionId: string; label: string}
>;
type RefreshEvent = ViewEvent<'onRefresh', Record<string, never>>;

type NativeListProps = Omit<
  ListProps,
  | 'onDeleteItem'
  | 'onMoveItem'
  | 'onSelectionChange'
  | 'onSwipeAction'
  | 'onRefresh'
> &
  DeleteItemEvent &
  MoveItemEvent &
  SelectItemEvent &
  SwipeActionEvent &
  RefreshEvent & {
    children: React.ReactNode;
  };

/**
 * List component that renders children using native SwiftUI list.
 */
export function List(props: ListProps) {
  const {children, ...nativeProps} = props;
  return (
    <ListNativeView {...transformListProps(nativeProps)}>
      {children}
    </ListNativeView>
  );
}
