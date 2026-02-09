import {requireNativeView} from 'expo';
import {ComponentType} from 'react';
import {type ContextMenuProps} from './types';
export {type ContextMenuProps} from './types';

const MenuNativeView: ComponentType<NativeMenuProps> = requireNativeView(
  'SykamoreUi',
  'ContextMenu',
);

const MenuNativeTriggerView: ComponentType<object> = requireNativeView(
  'SykamoreUi',
  'ContextMenuActivationElement',
);

const MenuNativePreviewView: ComponentType<object> = requireNativeView(
  'SykamoreUi',
  'ContextMenuPreview',
);

const MenuNativeItemsView: ComponentType<object> = requireNativeView(
  'SykamoreUi',
  'ContextMenuContent',
);

type NativeMenuProps = ContextMenuProps;

/**
 * Items visible inside the context menu. It could be `Section`, `Divider`, `Button`, `Toggle`, `Picker` or even `ContextMenu` itself for nested menus.
 */
export function Items(props: {children: React.ReactNode}) {
  return <MenuNativeItemsView {...props} />;
}

/**
 * The component visible all the time that triggers the context menu when long-pressed.
 */
export function Trigger(props: {children: React.ReactNode}) {
  return <MenuNativeTriggerView {...props} />;
}

/**
 * The component visible above the menu when it is opened.
 */
export function Preview(props: {children: React.ReactNode}) {
  return <MenuNativePreviewView {...props} />;
}

/**
 * `ContextMenu` allows you to create a context menu, which can be used to provide additional options to the user.
 */
function ContextMenu(props: ContextMenuProps) {
  return <MenuNativeView {...props} />;
}

ContextMenu.Trigger = Trigger;
ContextMenu.Preview = Preview;
ContextMenu.Items = Items;

export {ContextMenu};
