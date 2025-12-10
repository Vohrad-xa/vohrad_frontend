import {requireNativeView} from 'expo';
import type {SFSymbol} from 'sf-symbols-typescript';
import {View, Text as RNText} from 'react-native';
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

const PickerContentNativeView: React.ComponentType<any> = requireNativeView(
  'SykamoreUi',
  'PickerContentView',
);

const PickerLabelNativeView: React.ComponentType<any> = requireNativeView(
  'SykamoreUi',
  'PickerLabelView',
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
      // No string label to native in this branch
      label: undefined,
    });

    let labelNode: React.ReactNode = null;

    if (icon && typeof label === 'string') {
      labelNode = (
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
          {icon}
          <RNText>{label}</RNText>
        </View>
      );
    } else if (typeof label !== 'string') {
      labelNode = label;
    } else if (icon && !label) {
      labelNode = icon;
    }

    return (
      <PickerNativeView {...nativeProps}>
        {labelNode && (
          <PickerLabelNativeView>{labelNode}</PickerLabelNativeView>
        )}
        <PickerContentNativeView>{children}</PickerContentNativeView>
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
      <PickerContentNativeView>{children}</PickerContentNativeView>
    </PickerNativeView>
  );
}
