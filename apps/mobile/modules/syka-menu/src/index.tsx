import {forwardRef, useMemo} from 'react';
import {processColor, type ColorValue} from 'react-native';

import UIMenuView from './UIMenuView';
import type {
  MenuComponentProps,
  MenuComponentRef,
  NativeActionEvent,
  ProcessedMenuAction,
  SykaMenuAction,
} from './types';
import {objectHash} from './utils';

function processAction(
  action: SykaMenuAction,
  menuItemTextColor?: ColorValue,
): ProcessedMenuAction {
  if (action.separator) {
    return {
      separator: true,
      title: '',
      imageColor: processColor(undefined),
      titleColor: processColor(undefined),
    };
  }

  return {
    ...action,
    imageColor: processColor(action.imageColor),
    titleColor: processColor(action.titleColor ?? menuItemTextColor),
    subactions: action.subactions?.map((subAction) =>
      processAction(subAction, menuItemTextColor),
    ),
  };
}

const defaultHitslop = {top: 0, left: 0, bottom: 0, right: 0};

const SykaMenuView = forwardRef<MenuComponentRef, MenuComponentProps>(
  (
    {actions, hitSlop = defaultHitslop, menuItemTextColor, ...props},
    ref,
  ) => {
    const processedActions = actions.map<ProcessedMenuAction>((action) =>
      processAction(action, menuItemTextColor),
    );
    const hash = useMemo(() => {
      return objectHash(processedActions);
    }, [processedActions]);

    return (
      <UIMenuView
        {...props}
        hitSlop={hitSlop}
        actions={processedActions}
        actionsHash={hash}
        ref={ref}
      />
    );
  },
);

export {SykaMenuView};
export type {
  MenuComponentProps,
  MenuComponentRef,
  NativeActionEvent,
  SykaMenuAction,
};
