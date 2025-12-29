import {requireNativeView} from 'expo';

import type {NativeMenuComponentProps} from './types';

const MenuNativeView: React.ComponentType<NativeMenuComponentProps> =
  requireNativeView('SykaMenu', 'SykaMenuView');

export default MenuNativeView;
