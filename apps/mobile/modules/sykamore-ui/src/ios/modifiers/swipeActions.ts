import {createModifier, type ModifierConfig} from './createModifier';

/** Button role for swipe action styling */
export type SwipeActionRole = 'default' | 'destructive' | 'cancel';

/** Edge where swipe actions appear */
export type SwipeEdge = 'leading' | 'trailing';

/** Configuration for a single swipe action */
export interface ModifierSwipeAction {
  id: string;
  label: string;
  systemImage?: string;
  role?: SwipeActionRole;
  tint?: string;
}

/** Options for swipeActions modifier */
export interface SwipeActionsOptions {
  edge?: SwipeEdge;
  allowsFullSwipe?: boolean;
  actions: ModifierSwipeAction[];
  onAction?: (actionId: string, label: string) => void;
}

/**
 * Creates a swipeActions modifier for list rows.
 * Apply to items inside a List to enable swipe-to-reveal actions.
 *
 * @example
 * ```tsx
 * <List>
 *   <Text
 *     modifiers={[
 *       swipeActions({
 *         edge: 'trailing',
 *         actions: [
 *           { id: 'delete', label: 'Delete', systemImage: 'trash', role: 'destructive' },
 *           { id: 'flag', label: 'Flag', systemImage: 'flag' },
 *         ],
 *         onAction: (actionId) => console.log('Action:', actionId),
 *       }),
 *     ]}
 *   >
 *     Row content
 *   </Text>
 * </List>
 * ```
 */
export function swipeActions(options: SwipeActionsOptions): ModifierConfig {
  const {
    edge = 'trailing',
    allowsFullSwipe = true,
    actions,
    onAction,
  } = options;

  return createModifier('swipeActions', {
    edge,
    allowsFullSwipe,
    actions,
    eventListener: onAction
      ? (args: {actionId: string; label: string}) => {
          onAction(args.actionId, args.label);
        }
      : undefined,
  });
}
