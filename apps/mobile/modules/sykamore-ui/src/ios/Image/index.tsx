import {requireNativeView} from 'expo';
import {ColorValue} from 'react-native';
import {type SFSymbol} from 'sf-symbols-typescript';
import {type ViewEvent} from '../../types';
import {createViewModifierEventListener} from '../modifiers/utils';
import {type CommonViewModifierProps} from '../types';

export interface ImageProps extends CommonViewModifierProps {
  systemName: SFSymbol;
  variableValue?: number;
  onPress?: () => void;
}

type TapEvent = ViewEvent<'onTap', object> & {
  useTapGesture?: boolean;
};

type NativeImageProps = Omit<ImageProps, 'onPress'> | TapEvent;

function transformNativeProps(props: ImageProps): NativeImageProps {
  const {onPress, modifiers, ...restProps} = props;
  return {
    modifiers,
    ...(modifiers ? createViewModifierEventListener(modifiers) : undefined),
    ...restProps,
    ...(onPress ? {useTapGesture: true, onTap: () => onPress()} : null),
  };
}

const ImageNativeView: React.ComponentType<NativeImageProps> =
  requireNativeView('SykamoreUi', 'ImageView');

export function Image(props: ImageProps) {
  return <ImageNativeView {...transformNativeProps(props)} />;
}
