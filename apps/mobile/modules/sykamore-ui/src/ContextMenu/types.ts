import {ReactNode} from 'react';
import {type CommonViewModifierProps} from '../types';

export type ActivationMethod = 'singlePress' | 'longPress';

/**
 * Props of the `ContextMenu` component.
 */
export type ContextMenuProps = {
  activationMethod?: ActivationMethod;
  children: ReactNode;
} & CommonViewModifierProps;
