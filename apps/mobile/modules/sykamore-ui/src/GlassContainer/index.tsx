import {requireNativeView} from 'expo';
import {createViewModifierEventListener} from '../modifiers/utils';
import {type CommonViewModifierProps} from '../types';

export type GlassContainerProps = {
  children: React.ReactNode;
  spacing?: number;
} & CommonViewModifierProps;

type NativeGlassContainerProps = GlassContainerProps;

const GlassContainerNativeView: React.ComponentType<NativeGlassContainerProps> =
  requireNativeView('SykamoreUI', 'GlassContainerView');

export function GlassContainer(props: GlassContainerProps) {
  const eventProp = props.modifiers
    ? createViewModifierEventListener(props.modifiers)
    : undefined;
  return <GlassContainerNativeView {...props} {...eventProp} />;
}
