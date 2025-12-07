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
  useTapGesture?: boolean;
  onTap?: () => void;
  children?: React.ReactNode;
}

type NativeHStackProps = HStackProps;

const HStackNativeView: React.ComponentType<NativeHStackProps> =
  requireNativeView('SykamoreUi', 'HStackView');

function transformHStackProps(props: HStackProps): NativeHStackProps {
  const {modifiers, ...restProps} = props;
  return {
    modifiers,
    ...(modifiers ? createViewModifierEventListener(modifiers) : undefined),
    ...restProps,
  };
}

export function HStack(props: HStackProps) {
  return (
    <HStackNativeView {...transformHStackProps(props)}>
      {props.children}
    </HStackNativeView>
  );
}
