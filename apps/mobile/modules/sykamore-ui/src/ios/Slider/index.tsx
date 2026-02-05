import {requireNativeView} from 'expo';
import type {NativeSyntheticEvent} from 'react-native';
import {type CommonViewModifierProps} from '../types';

export type SliderProps = {
  value?: number;
  step?: number;
  min?: number;
  max?: number;
  label?: React.ReactNode;
  minimumValueLabel?: React.ReactNode;
  maximumValueLabel?: React.ReactNode;
  onValueChange?: (value: number) => void;
  onEditingChanged?: (isEditing: boolean) => void;
} & CommonViewModifierProps;

type NativeSliderProps = Omit<
  SliderProps,
  | 'onValueChange'
  | 'onEditingChanged'
  | 'label'
  | 'minimumValueLabel'
  | 'maximumValueLabel'
> & {
  onValueChanged?: (event: NativeSyntheticEvent<{value: number}>) => void;
  onEditingChanged?: (
    event: NativeSyntheticEvent<{isEditing: boolean}>,
  ) => void;
  children?: React.ReactNode;
};

const SliderNativeView: React.ComponentType<NativeSliderProps> =
  requireNativeView('SykamoreUi', 'SliderView');

const SliderValueLabelNativeView: React.ComponentType<{
  kind: 'label' | 'minimum' | 'maximum';
  children?: React.ReactNode;
}> = requireNativeView('SykamoreUi', 'SliderLabelView');

function transformSliderProps(props: SliderProps): NativeSliderProps {
  const {
    label,
    minimumValueLabel,
    maximumValueLabel,
    onValueChange,
    onEditingChanged,
    ...restProps
  } = props;
  return {
    ...restProps,
    onValueChanged: onValueChange
      ? ({nativeEvent: {value}}) => {
          onValueChange(value);
        }
      : undefined,
    onEditingChanged: onEditingChanged
      ? ({nativeEvent: {isEditing}}) => {
          onEditingChanged(isEditing);
        }
      : undefined,
  };
}

export function Slider(props: SliderProps) {
  const {label, minimumValueLabel, maximumValueLabel} = props;

  return (
    <SliderNativeView {...transformSliderProps(props)}>
      {label && (
        <SliderValueLabelNativeView kind="label">
          {label}
        </SliderValueLabelNativeView>
      )}
      {minimumValueLabel && (
        <SliderValueLabelNativeView kind="minimum">
          {minimumValueLabel}
        </SliderValueLabelNativeView>
      )}
      {maximumValueLabel && (
        <SliderValueLabelNativeView kind="maximum">
          {maximumValueLabel}
        </SliderValueLabelNativeView>
      )}
    </SliderNativeView>
  );
}
