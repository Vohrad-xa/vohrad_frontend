import {requireNativeView} from 'expo';
import {createViewModifierEventListener} from '../modifiers/utils';
import {type CommonViewModifierProps} from '../types';

export interface FormProps extends CommonViewModifierProps {
  children: React.ReactNode;

  /**
   * Disables scrolling in the form.
   * @default false
   * @platform ios 16.0+
   */
  scrollDisabled?: boolean;
}

const FormNativeView: React.ComponentType<FormProps> = requireNativeView(
  'SykamoreUi',
  'FormView',
);

function transformFormProps(props: FormProps): FormProps {
  const {modifiers, ...restProps} = props;
  return {
    modifiers,
    ...(modifiers ? createViewModifierEventListener(modifiers) : undefined),
    ...restProps,
  };
}

export function Form(props: FormProps) {
  return <FormNativeView {...transformFormProps(props)} />;
}
