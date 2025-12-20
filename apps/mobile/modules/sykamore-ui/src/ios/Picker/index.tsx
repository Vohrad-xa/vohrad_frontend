import {requireNativeView} from 'expo';
import type {SFSymbol} from 'sf-symbols-typescript';
import {HStack} from '../HStack';
import {createViewModifierEventListener} from '../modifiers/utils';
import {type CommonViewModifierProps} from '../types';

export type PickerStyle =
  | 'automatic'
  | 'menu'
  | 'segmented'
  | 'wheel'
  | 'inline';

export type PickerProps = {
  systemImage?: SFSymbol;
  label?: string | React.ReactNode;
  icon?: React.ReactNode;
  selection?: string | number | null;
  onSelectionChange?: (event: {
    nativeEvent: {selection: string | number};
  }) => void;

  pickerStyle?: PickerStyle;
  labelsHidden?: boolean;
  disabled?: boolean;

  children?: React.ReactNode;
} & CommonViewModifierProps;

const PickerNativeView: React.ComponentType<any> = requireNativeView(
  'SykamoreUi',
  'PickerView',
);

export const PickerContentView: React.ComponentType<{
  children?: React.ReactNode;
}> = requireNativeView('SykamoreUi', 'PickerContentView');

const PickerLabelNativeView: React.ComponentType<any> = requireNativeView(
  'SykamoreUi',
  'PickerLabelView',
);

const PickerLabelIconNativeView: React.ComponentType<any> = requireNativeView(
  'SykamoreUi',
  'PickerLabelIcon',
);

type NativePickerProps = Omit<PickerProps, 'icon' | 'children' | 'label'> & {
  label?: string;
  children?: React.ReactNode;
};

function transformPickerProps(
  props: Omit<PickerProps, 'icon' | 'children'> & {label?: string},
): NativePickerProps {
  const {modifiers, ...restProps} = props;
  return {
    modifiers,
    ...(modifiers ? createViewModifierEventListener(modifiers) : undefined),
    ...restProps,
  };
}

export function Picker(props: PickerProps) {
  const {label, icon, children, ...rest} = props;

  const hasCustomLabelNode = !!icon || typeof label !== 'string';

  if (hasCustomLabelNode) {
    const nativeProps = transformPickerProps({
      ...rest,
      // Keep string label for native so we can rebuild a SwiftUI Label spacing
      label: typeof label === 'string' ? label : undefined,
    });

    let labelNode: React.ReactNode = null;

    if (icon && typeof label === 'string') {
      labelNode = <PickerLabelIconNativeView>{icon}</PickerLabelIconNativeView>;
    } else if (icon && typeof label !== 'string') {
      labelNode = (
        <HStack alignment="center" spacing={6}>
          <PickerLabelIconNativeView>{icon}</PickerLabelIconNativeView>
          {label}
        </HStack>
      );
    } else if (!icon && typeof label !== 'string') {
      labelNode = label;
    }

    return (
      <PickerNativeView {...nativeProps}>
        {labelNode && (
          <PickerLabelNativeView>{labelNode}</PickerLabelNativeView>
        )}
        <PickerContentView>{children}</PickerContentView>
      </PickerNativeView>
    );
  }

  // Simple string label, no custom icon/label node → native text + optional systemImage
  const nativeProps = transformPickerProps({
    ...rest,
    label: typeof label === 'string' ? label : undefined,
  });

  return (
    <PickerNativeView {...nativeProps}>
      <PickerContentView>{children}</PickerContentView>
    </PickerNativeView>
  );
}
