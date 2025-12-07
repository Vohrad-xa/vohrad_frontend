import {ReactElement, ReactNode} from 'react';

import {type ButtonProps} from '../Button';
import {type CommonViewModifierProps} from '../types';

export type ActivationMethod = 'singlePress' | 'longPress';

/**
 * Props of the `ContextMenu` component.
 */
export type ContextMenuProps = {
  activationMethod?: ActivationMethod;
  children: ReactNode;
} & CommonViewModifierProps;

export type SubmenuProps = {
  button: ReactElement<ButtonProps>;
  children: ReactNode;
};
