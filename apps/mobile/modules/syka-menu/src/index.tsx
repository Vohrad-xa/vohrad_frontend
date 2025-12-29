import {forwardRef, useMemo} from 'react';
import {processColor} from 'react-native';

import UIMenuView from './UIMenuView';
import type {
  MenuComponentProps,
  MenuComponentRef,
  NativeActionEvent,
  ProcessedMenuAction,
  SykaMenuAction,
} from './types';
import {objectHash} from './utils';

function processAction(action: SykaMenuAction): ProcessedMenuAction {
  return {
    ...action,
    imageColor: processColor(action.imageColor),
    titleColor: processColor(action.androidTitleColor),
    subactions: action.subactions?.map((subAction) => processAction(subAction)),
  };
}

const defaultHitslop = {top: 0, left: 0, bottom: 0, right: 0};

const SykaMenuView = forwardRef<MenuComponentRef, MenuComponentProps>(
  (
    {
      actions,
      hitSlop = defaultHitslop,
      shouldOpenOnLongPress = false,
      isAnchoredToRight = false,
      ...props
    },
    ref,
  ) => {
    const processedActions = actions.map<ProcessedMenuAction>((action) =>
      processAction(action),
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
        shouldOpenOnLongPress={shouldOpenOnLongPress}
        isAnchoredToRight={isAnchoredToRight}
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
