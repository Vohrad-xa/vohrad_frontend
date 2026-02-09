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
  // MARK: Style
  /** SwiftUI list style (default: 'automatic') */
  listStyle?: ListStyle;

  // MARK: Selection
  /** Allow selection of list items */
  selectEnabled?: boolean;
  /** Selection behavior ('multiple' by default) */
  selectionMode?: SelectionMode;
  /**
   * Controlled selection - array of tag values for selected items.
   * Children should use the `tag(id)` modifier for stable selection.
   */
  selection?: (string | number)[];

  // MARK: Editing
  /** Enable reordering of list items */
  moveEnabled?: boolean;
  /** Allow deletion of list items */
  deleteEnabled?: boolean;
  /** Enable SwiftUI edit mode */
  editModeEnabled?: boolean;

  // MARK: Scroll
  /** Disables scrolling in the list (iOS 16.0+) */
  scrollDisabled?: boolean;

  // MARK: Refresh
  /** Enable pull-to-refresh (iOS 15.0+) */
  refreshEnabled?: boolean;
  /** Control refresh indicator visibility; set to true while fetching and false to end */
  refreshing?: boolean;

  // MARK: Swipe Actions
  /** Leading edge swipe actions (iOS 15.0+) */
  leadingSwipeActions?: SwipeActionsConfig;
  /** Trailing edge swipe actions (iOS 15.0+) */
  trailingSwipeActions?: SwipeActionsConfig;

  // MARK: Children
  /** Children elements rendered inside the list */
  children: React.ReactNode;

  // MARK: Callbacks
  /** Callback when item is deleted */
  onDeleteItem?: (index: number) => void;
  /** Callback when item is moved */
  onMoveItem?: (from: number, to: number) => void;
  /**
   * Callback when selection changes.
   * Returns tag values from selected children (use `tag(id)` modifier on children).
   */
  onSelectionChange?: (selection: (string | number)[]) => void;
  /** Callback when swipe action is triggered */
  onSwipeAction?: (actionId: string, label: string) => void;
  /** Callback when pull-to-refresh is triggered */
  onRefresh?: () => void;
}

type DeleteItemEvent = ViewEvent<'onDeleteItem', {index: number}>;
type MoveItemEvent = ViewEvent<'onMoveItem', {from: number; to: number}>;
type SelectItemEvent = ViewEvent<
  'onSelectionChange',
  {selection: (string | number)[]}
>;
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
