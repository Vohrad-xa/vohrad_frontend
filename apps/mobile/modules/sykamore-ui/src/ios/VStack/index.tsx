import {requireNativeView} from 'expo';

import {createViewModifierEventListener} from '../modifiers/utils';
import {type CommonViewModifierProps} from '../types';

export type VStackAlignment = 'leading' | 'center' | 'trailing';

export interface VStackProps extends CommonViewModifierProps {
  spacing?: number;
  alignment?: VStackAlignment;
  backgroundColor?: string;
  useTapGesture?: boolean;
  onTap?: () => void;
  children?: React.ReactNode;
}

type NativeVStackProps = VStackProps;

const VStackNativeView: React.ComponentType<NativeVStackProps> =
  requireNativeView('SykamoreUi', 'VStackView');

function transformVStackProps(props: VStackProps): NativeVStackProps {
  const {modifiers, ...restProps} = props;
  return {
    modifiers,
    ...(modifiers ? createViewModifierEventListener(modifiers) : undefined),
    ...restProps,
  };
}

export function VStack(props: VStackProps) {
  return (
    <VStackNativeView {...transformVStackProps(props)}>
      {props.children}
    </VStackNativeView>
  );
}
