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

type NativeSwitchProps = Omit<SwitchProps, 'onValueChange'> & {
  onValueChange: (event: NativeSyntheticEvent<{value: boolean}>) => void;
};

const SwitchNativeView: React.ComponentType<NativeSwitchProps> =
  requireNativeView('SykamoreUi', 'SwitchView');

function transformSwitchProps(props: SwitchProps): NativeSwitchProps {
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
  return <SwitchNativeView {...transformSwitchProps(props)} />;
}
