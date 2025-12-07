import {requireNativeView} from 'expo';
import type {SFSymbol} from 'sf-symbols-typescript';

import {createViewModifierEventListener} from '../modifiers/utils';
import {type CommonViewModifierProps} from '../types';

export type PickerProps = {
  systemImage?: SFSymbol;
  label?: string | React.ReactNode;
  selection?: string | number | null;
  onSelectionChange?: (event: {
    nativeEvent: {selection: string | number};
  }) => void;

  children?: React.ReactNode;
} & CommonViewModifierProps;

const PickerNativeView: React.ComponentType<PickerProps> = requireNativeView(
  'SykamoreUi',
  'PickerView',
);

const PickerContentNativeView: React.ComponentType<PickerProps> =
  requireNativeView('SykamoreUi', 'PickerContentView');

const PickerLabelNativeView: React.ComponentType<PickerProps> =
  requireNativeView('SykamoreUi', 'PickerLabelView');

type NativePickerProps = PickerProps;

function transformPickerProps(props: PickerProps): NativePickerProps {
  const {modifiers, ...restProps} = props;
  return {
    modifiers,
    ...(modifiers ? createViewModifierEventListener(modifiers) : undefined),
    ...restProps,
  };
}

export function Picker(props: PickerProps) {
  const {label, children, ...restProps} = transformPickerProps(props);
  if (typeof label === 'string') {
    return (
      <PickerNativeView {...restProps} label={label}>
        <PickerContentNativeView>{children}</PickerContentNativeView>
      </PickerNativeView>
    );
  } else {
    return (
      <PickerNativeView {...restProps}>
        <PickerLabelNativeView>{label}</PickerLabelNativeView>
        <PickerContentNativeView>{children}</PickerContentNativeView>
      </PickerNativeView>
    );
  }
}
