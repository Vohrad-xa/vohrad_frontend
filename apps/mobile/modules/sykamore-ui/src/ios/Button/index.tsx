import {requireNativeView} from 'expo';
import {type SFSymbol} from 'sf-symbols-typescript';
import {type ViewEvent} from '../../types';
import {createViewModifierEventListener} from '../modifiers/utils';
import {type CommonViewModifierProps} from '../types';
import {Text} from '../Text';

/**
 * The role of the button.
 * - `default` - The default button role.
 * - `cancel` - A button that cancels the current operation.
 * - `destructive` - A button that deletes data or performs a destructive action.
 */
export type ButtonRole = 'default' | 'cancel' | 'destructive';

export type ButtonProps = {
  onPress?: () => void;
  systemImage?: SFSymbol;
  role?: ButtonRole;
  label?: string;
  children?: React.ReactNode;
} & CommonViewModifierProps;

type NativeButtonProps = Omit<ButtonProps, 'onPress'> &
  ViewEvent<'onButtonPress', void>;

const ButtonNativeView: React.ComponentType<NativeButtonProps> =
  requireNativeView('SykamoreUi', 'Button');

/**
 * Displays a native button component.
 *
 * @example
 * ```tsx
 * import { Button } from '@expo/ui/swift-ui';
 * import { buttonStyle, controlSize, tint, disabled } from '@expo/ui/swift-ui/modifiers';
 *
 * <Button
 *   role="destructive"
 *   onPress={handlePress}
 *   label="Delete"
 *   modifiers={[
 *     buttonStyle('bordered'),
 *     controlSize('large'),
 *     tint('#FF0000'),
 *     disabled(true)
 *   ]}
 * />
 * ```
 */
export function Button(props: ButtonProps) {
  const {label, children, onPress, modifiers, ...restProps} = props;

  const baseProps = {
    ...restProps,
    modifiers,
    ...(modifiers ? createViewModifierEventListener(modifiers) : undefined),
    onButtonPress: onPress,
  };

  const content =
    typeof children === 'string' ? <Text>{children}</Text> : children;

  return (
    <ButtonNativeView {...baseProps} label={label}>
      {content}
    </ButtonNativeView>
  );
}
