import {requireNativeView} from 'expo';

import {createViewModifierEventListener} from '../modifiers/utils';
import {type CommonViewModifierProps, type ViewEvent} from '../types';

const ListNativeView: React.ComponentType<NativeListProps> =
  requireNativeView<NativeListProps>('SykamoreUi', 'ListView');

function transformListProps(
  props: Omit<ListProps, 'children'>,
): Omit<NativeListProps, 'children'> {
  const {modifiers, onSwipeAction, ...restProps} = props;
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
  };
}

export type ListStyle =
  | 'automatic'
  | 'plain'
  | 'inset'
  | 'insetGrouped'
  | 'grouped'
  | 'sidebar';

/** Button role for swipe action styling */
export type SwipeActionRole = 'default' | 'destructive' | 'cancel';

/** Single swipe action configuration */
export interface SwipeAction {
  /** Unique identifier for the action */
  id: string;
  /** Display label for the action */
  label: string;
  /** SF Symbol name for the action icon */
  systemImage?: string;
  /** Button role for styling (destructive shows red) */
  role?: SwipeActionRole;
  /** Custom tint color (hex string like "#FF0000") */
  tint?: string;
}

/** Swipe actions configuration for an edge */
export interface SwipeActionsConfig {
  /** Array of swipe actions */
  actions: SwipeAction[];
  /** Allow full swipe to trigger first action (default: true) */
  allowsFullSwipe?: boolean;
}

export interface ListProps extends CommonViewModifierProps {
  /** SwiftUI list style (default: 'automatic') */
  listStyle?: ListStyle;
  /** Allow selection of list items */
  selectEnabled?: boolean;
  /** Enable reordering of list items */
  moveEnabled?: boolean;
  /** Allow deletion of list items */
  deleteEnabled?: boolean;
  /** Make the list scrollable (iOS 16.0+) */
  scrollEnabled?: boolean;
  /** Enable SwiftUI edit mode */
  editModeEnabled?: boolean;
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
}

type DeleteItemEvent = ViewEvent<'onDeleteItem', {index: number}>;
type MoveItemEvent = ViewEvent<'onMoveItem', {from: number; to: number}>;
type SelectItemEvent = ViewEvent<'onSelectionChange', {selection: number[]}>;
type SwipeActionEvent = ViewEvent<
  'onSwipeAction',
  {actionId: string; label: string}
>;

type NativeListProps = Omit<
  ListProps,
  'onDeleteItem' | 'onMoveItem' | 'onSelectionChange' | 'onSwipeAction'
> &
  DeleteItemEvent &
  MoveItemEvent &
  SelectItemEvent &
  SwipeActionEvent & {
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
