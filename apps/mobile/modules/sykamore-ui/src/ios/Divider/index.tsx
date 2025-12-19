import {requireNativeView} from 'expo';
import {type CommonViewModifierProps} from '../types';

export type DividerProps = CommonViewModifierProps;

const DividerNativeView: React.ComponentType<DividerProps> = requireNativeView(
  'SykamoreUi',
  'DividerView',
);

export function Divider(props: DividerProps) {
  return <DividerNativeView {...props} />;
}
