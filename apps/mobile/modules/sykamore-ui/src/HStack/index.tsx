import {requireNativeView} from 'expo';

import {createViewModifierEventListener} from '../modifiers/utils';
import {type CommonViewModifierProps} from '../types';

export type HStackAlignment =
  | 'top'
  | 'center'
  | 'bottom'
  | 'firstTextBaseline'
  | 'lastTextBaseline';

export interface HStackProps extends CommonViewModifierProps {
  spacing?: number;
  alignment?: HStackAlignment;
  backgroundColor?: string;
  onPress?: () => void;
  children?: React.ReactNode;
}

// Native-only props
type NativeHStackProps = Omit<HStackProps, 'onPress'> & {
  useTapGesture?: boolean;
  onTap?: () => void;
};

const HStackNativeView: React.ComponentType<NativeHStackProps> =
  requireNativeView('SykamoreUi', 'HStackView');

function transformHStackProps(props: HStackProps): NativeHStackProps {
  const {modifiers, onPress, ...restProps} = props;

  return {
    ...restProps,
    // wire JS onPress into native tap
    useTapGesture: !!onPress,
    onTap: onPress,
    modifiers,
    ...(modifiers ? createViewModifierEventListener(modifiers) : undefined),
  };
}

export function HStack(props: HStackProps) {
  const nativeProps = transformHStackProps(props);

  return <HStackNativeView {...nativeProps}>{props.children}</HStackNativeView>;
}
