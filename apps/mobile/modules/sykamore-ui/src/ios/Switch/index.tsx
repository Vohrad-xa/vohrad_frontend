import {requireNativeView} from 'expo';
import {NativeSyntheticEvent} from 'react-native';
import type {ColorValue} from 'react-native';
import {type SFSymbol} from 'sf-symbols-typescript';

import {createViewModifierEventListener} from '../modifiers/utils';
import {type CommonViewModifierProps} from '../types';

export type SwitchProps = {
  value: boolean;
  label?: string;
  systemImage?: SFSymbol;
  icon?: React.ReactNode;
  variant?: 'checkbox' | 'switch' | 'button';
  onValueChange?: (value: boolean) => void;
  color?: ColorValue;
} & (
  | SwitchSwitchVariantProps
  | SwitchCheckboxVariantProps
  | SwitchButtonVariantProps
) &
  CommonViewModifierProps;

export type SwitchSwitchVariantProps = {
  variant?: 'switch';
};

export type SwitchCheckboxVariantProps = {
  variant: 'checkbox';
};

export type SwitchButtonVariantProps = {
  variant: 'button';
  elementColors?: undefined;
};

type NativeSwitchProps = Omit<SwitchProps, 'onValueChange' | 'icon'> & {
  onValueChange: (event: NativeSyntheticEvent<{value: boolean}>) => void;
};

const SwitchNativeView: React.ComponentType<NativeSwitchProps> =
  requireNativeView('SykamoreUi', 'SwitchView');
const SwitchIconNativeView: React.ComponentType<{children?: React.ReactNode}> =
  requireNativeView('SykamoreUi', 'SwitchIcon');

function transformSwitchProps(
  props: Omit<SwitchProps, 'icon'>,
): NativeSwitchProps {
  const {modifiers, ...restProps} = props;
  return {
    modifiers,
    ...(modifiers ? createViewModifierEventListener(modifiers) : undefined),
    ...restProps,
    variant: props.variant ?? 'switch',
    color: props.color,
    onValueChange: ({nativeEvent: {value}}) => {
      props?.onValueChange?.(value);
    },
  } as NativeSwitchProps;
}

export function Switch(props: SwitchProps) {
  const {icon, ...rest} = props;
  return (
    <SwitchNativeView {...transformSwitchProps(rest)}>
      {icon && <SwitchIconNativeView>{icon}</SwitchIconNativeView>}
    </SwitchNativeView>
  );
}
