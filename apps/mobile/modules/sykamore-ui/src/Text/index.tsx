import {requireNativeView} from 'expo';
import type {ColorValue} from 'react-native';
import {getTextFromChildren} from '../utils';
import {createViewModifierEventListener} from '../modifiers/utils';
import {type CommonViewModifierProps} from '../types';

export interface TextProps extends CommonViewModifierProps {
  /**
   * The children of the text.
   * Only string and number are supported.
   */
  children?: React.ReactNode;
  /**
   * The font weight of the text.
   * Maps to iOS system font weights.
   * @deprecated Use the font() modifier instead: modifiers={[font({ weight: 'bold' })]}
   */
  weight?:
    | 'ultraLight'
    | 'thin'
    | 'light'
    | 'regular'
    | 'medium'
    | 'semibold'
    | 'bold'
    | 'heavy'
    | 'black';
  /**
   * The font design of the text.
   * Maps to iOS system font designs.
   * @deprecated Use the font() modifier instead: modifiers={[font({ design: 'rounded' })]}
   */
  design?: 'default' | 'rounded' | 'serif' | 'monospaced';
  /**
   * The font size of the text.
   * @deprecated Use the font() modifier instead: modifiers={[font({ size: 18 })]}
   */
  size?: number;
  /**
   * The line limit of the text.
   */
  lineLimit?: number;
  /**
   * The color of the text.
   */
  color?: ColorValue;
  /**
   * Transforms the text case (uppercase or lowercase).
   */
  textCase?: 'uppercase' | 'lowercase';
  /**
   * If true, applies bold font weight to the text.
   */
  bold?: boolean;
  /**
   * If true, applies italic style to the text.
   */
  italic?: boolean;
  /**
   * If true, underlines the text.
   */
  underline?: boolean;
  /**
   * If true, applies strikethrough to the text.
   */
  strikethrough?: boolean;
  /**
   * If true, uses monospaced font for the text.
   */
  monospaced?: boolean;
  /**
   * If true, uses monospaced font for digits only (keeps letters proportional).
   * Useful for displaying numbers that change frequently.
   */
  monospacedDigit?: boolean;
  /**
   * Adjusts the spacing between characters (letter-spacing).
   * Positive values increase spacing, negative values decrease it.
   */
  kerning?: number;
  /**
   * Adjusts the spacing between characters with looser or tighter tracking.
   * Similar to kerning but uses a different calculation.
   */
  tracking?: number;
  /**
   * Adjusts the vertical offset of the text from its baseline.
   * Positive values move text up, negative values move text down.
   */
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
