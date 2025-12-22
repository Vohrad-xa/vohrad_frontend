import {requireNativeView} from 'expo';
import {getTextFromChildren} from '../../utils';
import {createViewModifierEventListener} from '../modifiers/utils';
import {type CommonViewModifierProps} from '../types';

export interface TextProps extends CommonViewModifierProps {
  /**
   * The children of the text.
   * Only string and number are supported.
   */
  children?: React.ReactNode;
  lineLimit?: number;
  textCase?: 'uppercase' | 'lowercase';
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  monospaced?: boolean;
  monospacedDigit?: boolean;
  kerning?: number;
  tracking?: number;
  baselineOffset?: number;
}

type NativeTextProps = Omit<TextProps, 'children'> & {
  text: string;
};

const TextNativeView: React.ComponentType<
  Omit<TextProps, 'children'> & {text: string}
> = requireNativeView('SykamoreUi', 'TextView');

function transformTextProps(props: TextProps): NativeTextProps {
  const {children, modifiers, ...restProps} = props;
  const text = getTextFromChildren(children);
  return {
    modifiers,
    ...(modifiers ? createViewModifierEventListener(modifiers) : undefined),
    ...restProps,
    text: text ?? '',
  };
}

export function Text(props: TextProps) {
  return <TextNativeView {...transformTextProps(props)} />;
}
