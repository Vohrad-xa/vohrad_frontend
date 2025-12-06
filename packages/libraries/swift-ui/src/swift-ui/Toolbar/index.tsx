import { requireNativeView } from 'expo';
import type React from 'react';
import type { ComponentType } from 'react';

export type ToolbarItemPlacement =
  | 'automatic'
  | 'principal'
  | 'navigation'
  | 'primaryAction'
  | 'secondaryAction'
  | 'status'
  | 'confirmationAction'
  | 'cancellationAction'
  | 'destructiveAction'
  | 'navigationBarLeading'
  | 'navigationBarTrailing'
  | 'topBarLeading'
  | 'topBarTrailing'
  | 'bottomBar'
  | 'keyboard';

export type ToolbarProps = {
  children: React.ReactNode;
};

export type ToolbarItemProps = {
  placement?: ToolbarItemPlacement;
  children: React.ReactNode;
};

const ToolbarNativeView: ComponentType<ToolbarProps> = requireNativeView('ExpoUI', 'ToolbarView');

const ToolbarItemNativeView: ComponentType<ToolbarItemProps> = requireNativeView(
  'ExpoUI',
  'ToolbarItemView'
);

const ToolbarGroupNativeView: ComponentType<ToolbarItemProps> = requireNativeView(
  'ExpoUI',
  'ToolbarGroupView'
);

function ToolbarItem(props: ToolbarItemProps) {
  return <ToolbarItemNativeView {...props} />;
}

function ToolbarGroup(props: ToolbarItemProps) {
  return <ToolbarGroupNativeView {...props} />;
}

/**
 * Adds toolbar items to the current scene using the native SwiftUI toolbar API.
 * Place this component anywhere inside your SwiftUI host tree.
 */
function Toolbar(props: ToolbarProps) {
  return <ToolbarNativeView {...props} />;
}

Toolbar.Item = ToolbarItem;
Toolbar.Group = ToolbarGroup;

export { Toolbar };
