import {requireNativeView} from 'expo';
import type {ColorValue} from 'react-native';
import {type SFSymbol} from 'sf-symbols-typescript';

import {type ViewEvent} from '../../types';
import {getTextFromChildren} from '../../utils';
import {createViewModifierEventListener} from '../modifiers/utils';
import {type CommonViewModifierProps} from '../types';

export type ButtonRole = 'default' | 'cancel' | 'destructive';

export type ButtonControlSize =
  | 'mini'
  | 'small'
  | 'regular'
  | 'large'
  | 'extraLarge';

/**
 * The built-in button styles available on iOS.
 *
 * Common styles:
 * - `default` - The default system button style.
 * - `bordered` - A button with a light fill.
 * - `borderless` - A button with no background or border
 * - `borderedProminent` - A bordered button with a prominent appearance.
 * - `plain` - A button with no border or background and a less prominent text.
 * - `glass` – A liquid glass button effect (available only from iOS 26, when built with Xcode 26).
 * - `glassProminent` – A liquid glass button effect – (available only from iOS 26, when built with Xcode 26)
 */
export type ButtonVariant =
  // Common
  | 'default'
  | 'bordered'
  | 'plain'
  | 'glass'
  | 'glassProminent'
  | 'borderedProminent'
  | 'borderless';

export type ButtonProps = {
  onPress?: () => void;
  systemImage?: SFSymbol;
  role?: ButtonRole;
  controlSize?: ButtonControlSize;
  variant?: ButtonVariant;
  children?: string | React.ReactNode;
  color?: ColorValue;
  disabled?: boolean;
} & CommonViewModifierProps;

/**
 * exposed for ContextMenu
 * @hidden
 */
export type NativeButtonProps = Omit<
  ButtonProps,
  'role' | 'onPress' | 'children' | 'systemImage' | 'controlSize'
> & {
  buttonRole?: ButtonRole;
  text: string | undefined;
  systemImage?: SFSymbol;
} & ViewEvent<'onButtonPressed', void>;

// We have to work around the `role` and `onPress` props being reserved by React Native.
const ButtonNativeView: React.ComponentType<NativeButtonProps> =
  requireNativeView('SykamoreUi', 'Button');

/**
 * exposed for ContextMenu
 * @hidden
 */
export function transformButtonProps(
  props: Omit<ButtonProps, 'children'>,
  text: string | undefined,
): NativeButtonProps {
  const {role, onPress, systemImage, modifiers, ...restProps} = props;
  return {
    modifiers,
    ...(modifiers ? createViewModifierEventListener(modifiers) : undefined),
    ...restProps,
    text,
    systemImage,
    buttonRole: role,
    onButtonPressed: onPress,
  };
}

/**
 * Displays a native button component.
 */
export function Button(props: ButtonProps) {
  const {children, ...restProps} = props;

  if (!children && !restProps.systemImage) {
    throw new Error(
      'Button without systemImage prop should have React children',
    );
  }

  const text = getTextFromChildren(children);

  const transformedProps = transformButtonProps(restProps, text);

  // Render without children wrapper if text-only or icon-only
  const shouldRenderDirectly = text != null || children == null;

  if (shouldRenderDirectly) {
    return <ButtonNativeView {...transformedProps} />;
  }
  return <ButtonNativeView {...transformedProps}>{children}</ButtonNativeView>;
}
