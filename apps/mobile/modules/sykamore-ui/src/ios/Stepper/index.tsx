import {requireNativeView} from 'expo';
import {type ViewEvent} from '../../types';
import {createViewModifierEventListener} from '../modifiers/utils';
import {type CommonViewModifierProps} from '../types';

export type StepperProps = {
  label: string;
  defaultValue?: number;
  step?: number;
  min?: number;
  max?: number;
  onValueChanged: (value: number) => void;
} & CommonViewModifierProps;

type NativeStepperProps = Omit<StepperProps, 'onValueChanged'> &
  ViewEvent<'onValueChanged', {value: number}>;

const StepperNativeView: React.ComponentType<NativeStepperProps> =
  requireNativeView('sykamoreUi', 'StepperView');

function transformStepperProps(props: StepperProps): NativeStepperProps {
  const {modifiers, ...restProps} = props;
  return {
    modifiers,
    ...(modifiers ? createViewModifierEventListener(modifiers) : undefined),
    ...restProps,
    onValueChanged: ({nativeEvent: {value}}) => {
      props.onValueChanged(value);
    },
  };
}

export function Stepper(props: StepperProps) {
  return <StepperNativeView {...transformStepperProps(props)} />;
}
