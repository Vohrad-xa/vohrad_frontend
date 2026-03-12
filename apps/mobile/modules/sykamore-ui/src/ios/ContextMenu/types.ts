import {type ReactElement, type ReactNode} from 'react';
import {type ButtonProps} from '../Button';
import {type CommonViewModifierProps} from '../types';

/**
 * Props of the `ContextMenu` component.
 */
export type ContextMenuProps = {
  children: ReactNode;
} & CommonViewModifierProps;

/**
 * Props of the `Submenu` component.
 * @deprecated Use `ContextMenu` component as submenu instead.
 */
export type SubmenuProps = {
  button: ReactElement<ButtonProps>;
  children: ReactNode;
};
