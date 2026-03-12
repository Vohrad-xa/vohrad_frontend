import {requireNativeView} from 'expo';
import {type Ref} from 'react';
import {type ViewEvent} from '../../types';
import {createViewModifierEventListener} from '../modifiers/utils';
import {type CommonViewModifierProps} from '../types';

/**
 * Determines which keyboard to open. For example, `'numeric'`.
 *
 * Available options:
 * - default
 * - numeric
 * - email-address
 * - phone-pad
 * - decimal-pad
 * - ascii-capable
 * - url
 * - numbers-and-punctuation
 * - name-phone-pad
 * - twitter
 * - web-search
 * - ascii-capable-number-pad
 *
 * @default default
 */
export type TextFieldKeyboardType =
  | 'default'
  | 'email-address'
  | 'numeric'
  | 'phone-pad'
  | 'ascii-capable'
  | 'numbers-and-punctuation'
  | 'url'
  | 'name-phone-pad'
  | 'decimal-pad'
  | 'twitter'
  | 'web-search'
  | 'ascii-capable-number-pad';

/**
 * Specifies the type of content for autofill and keyboard suggestions.
 */
export type TextContentType =
  | 'email-address'
  | 'password'
  | 'new-password'
  | 'one-time-code'
  | 'username'
  | 'name'
  | 'given-name'
  | 'family-name'
  | 'telephone-number'
  | 'address-city'
  | 'address-state'
  | 'postal-code'
  | 'street-address-line1'
  | 'street-address-line2'
  | 'credit-card-number';

/**
 * Configures the text that appears in the return key on the keyboard.
 */
export type SubmitLabel =
  | 'done'
  | 'go'
  | 'send'
  | 'search'
  | 'next'
  | 'continue'
  | 'return';

/**
 * Configures automatic capitalization behavior.
 */
export type TextInputAutocapitalization =
  | 'never'
  | 'words'
  | 'sentences'
  | 'characters';

/**
 * Configures the visual style of the text field.
 */
export type TextFieldStyleType = 'automatic' | 'plain' | 'rounded-border';

/**
 * Can be used for imperatively setting text and focus on the `TextField` component.
 */
export type TextFieldRef = {
  setText: (newText: string) => Promise<void>;
  focus: () => Promise<void>;
  blur: () => Promise<void>;
  /**
   * Programmatically select text using start and end indices.
   * @platform ios 18.0+ tvos 18.0+
   */
  setSelection: (start: number, end: number) => Promise<void>;
};

export type TextFieldProps = {
  ref?: Ref<TextFieldRef>;
  /**
   * Initial value that the `TextField` displays when being mounted. As the `TextField` is an uncontrolled component, change the key prop if you need to change the text value.
   */
  defaultValue?: string;
  /**
   * A text that is displayed when the field is empty.
   */
  placeholder?: string;
  /**
   * A callback triggered when user types in text into the `TextField`.
   */
  onChangeText?: (value: string) => void;
  /**
   * A callback triggered when user focuses or blurs the `TextField`.
   */
  onChangeFocus?: (focused: boolean) => void;
  /**
   * A callback triggered when user submits the `TextField` by pressing the return key.
   */
  onSubmit?: (value: string) => void;
  /**
   * A callback triggered when user selects text in the TextField.
   * @platform ios 18.0+ tvos 18.0+
   */
  onChangeSelection?: ({start, end}: {start: number; end: number}) => void;
  /**
   * If true, the text input can be multiple lines.
   * While the content will wrap, there's no keyboard button to insert a new line.
   */
  multiline?: boolean;
  /**
   * If true, the text input will add new lines when the user presses the return key.
   * @default true
   */
  allowNewlines?: boolean;
  /**
   * The number of lines to display when `multiline` is set to true.
   * If the number of lines in the view is above this number, the view scrolls.
   * @default undefined, which means unlimited lines.
   */
  numberOfLines?: number;

  keyboardType?: TextFieldKeyboardType;
  /**
   * If true, autocorrection is enabled.
   * @default true
   */
  autocorrection?: boolean;

  /**
   * If true, the text input will be focused automatically when the component is mounted.
   * @default false
   */
  autoFocus?: boolean;

  /**
   * If true, renders as a secure text entry (password field).
   * @default false
   */
  isSecure?: boolean;

  /**
   * Specifies the semantic meaning of the text content for autofill and keyboard suggestions.
   * Helps iOS provide relevant keyboard and autofill options.
   */
  textContentType?: TextContentType;

  /**
   * Configures the text that appears in the return key on the keyboard.
   * @default undefined (uses platform default)
   */
  submitLabel?: SubmitLabel;

  /**
   * Configures automatic capitalization behavior.
   * @default undefined (uses platform default)
   */
  autocapitalization?: TextInputAutocapitalization;

  /**
   * Configures the visual style of the text field.
   * @default 'automatic'
   */
  textFieldStyle?: TextFieldStyleType;
} & CommonViewModifierProps;

export type NativeTextFieldProps = Omit<
  TextFieldProps,
  'onChangeText' | 'onSubmit' | 'onChangeFocus' | 'onChangeSelection'
> &
  ViewEvent<'onChangeText', {value: string}> &
  ViewEvent<'onChangeFocus', {value: boolean}> &
  ViewEvent<'onChangeSelection', {start: number; end: number}> &
  ViewEvent<'onSubmit', {value: string}>;
// We have to work around the `role` and `onPress` props being reserved by React Native.
const TextFieldNativeView: React.ComponentType<NativeTextFieldProps> =
  requireNativeView('SykamoreUi', 'TextFieldView');

function transformTextFieldProps(props: TextFieldProps): NativeTextFieldProps {
  const {
    modifiers,
    onChangeText,
    onChangeFocus,
    onChangeSelection,
    onSubmit,
    ...restProps
  } = props;
  return {
    ...restProps,
    modifiers,
    ...(modifiers ? createViewModifierEventListener(modifiers) : undefined),
    onChangeText: (event: {nativeEvent: {value: string}}) => {
      onChangeText?.(event.nativeEvent.value);
    },
    onChangeFocus: (event: {nativeEvent: {value: boolean}}) => {
      onChangeFocus?.(event.nativeEvent.value);
    },
    onChangeSelection: (event: {nativeEvent: {start: number; end: number}}) => {
      onChangeSelection?.(event.nativeEvent);
    },
    onSubmit: (event: {nativeEvent: {value: string}}) => {
      onSubmit?.(event.nativeEvent.value);
    },
  };
}

/**
 * Renders a `TextField` component. Should mostly be used for embedding text inputs inside of SwiftUI lists and sections. Is an uncontrolled component.
 */
export function TextField(props: TextFieldProps) {
  return <TextFieldNativeView {...transformTextFieldProps(props)} />;
}
