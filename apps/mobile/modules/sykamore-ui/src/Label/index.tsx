import {requireNativeView} from 'expo';
import type {ColorValue} from 'react-native';
import {type SFSymbol} from 'sf-symbols-typescript';

import {createViewModifierEventListener} from '../modifiers/utils';
import {type CommonViewModifierProps} from '../types';

export type LabelProps = {
  title?: string;
  systemImage?: SFSymbol;
  icon?: React.ReactNode;
  color?: ColorValue;
} & CommonViewModifierProps;

const LabelNativeView: React.ComponentType<
  LabelProps & {children?: React.ReactNode}
> = requireNativeView('SykamoreUI', 'LabelView');
const LabelIconNativeView: React.ComponentType<{children?: React.ReactNode}> =
  requireNativeView('SykamoreUI', 'LabelIcon');

export function Label(props: LabelProps) {
  const {modifiers, icon, ...restProps} = props;
  return (
    <LabelNativeView
      modifiers={modifiers}
      {...(modifiers ? createViewModifierEventListener(modifiers) : undefined)}
      {...restProps}
    >
      {icon && <LabelIconNativeView>{icon}</LabelIconNativeView>}
    </LabelNativeView>
  );
}
