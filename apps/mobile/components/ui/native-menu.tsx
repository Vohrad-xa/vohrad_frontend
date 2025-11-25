import React from 'react';
import {MenuView, type MenuAction} from '@react-native-menu/menu';

export type NativeMenuAction = {
  id: string;
  title: string;
  subtitle?: string;
  destructive?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  state?: 'on' | 'off' | 'mixed';
  image?: string;
  divider?: boolean;
  subactions?: NativeMenuAction[];
};

export type NativeMenuProps = {
  actions: NativeMenuAction[];
  onSelect: (actionId: string) => void;
  children: React.ReactNode;
  shouldOpenOnLongPress?: boolean;
  isAnchoredToRight?: boolean;
};

export function NativeMenu({
  actions,
  onSelect,
  children,
  shouldOpenOnLongPress = false,
  isAnchoredToRight = false,
}: NativeMenuProps) {
  const handlePressAction = ({nativeEvent}: {nativeEvent: {event: string}}) => {
    onSelect(nativeEvent.event);
  };

  const transformedActions: MenuAction[] = actions.map((action) => ({
    id: action.id,
    title: action.title,
    subtitle: action.subtitle,
    image: action.image,
    imageColor: undefined,
    titleColor: undefined,
    state: action.state,
    attributes: {
      destructive: action.destructive,
      disabled: action.disabled,
      hidden: action.hidden,
    },
    subactions: action.subactions
      ? action.subactions.map((sub) => ({
          id: sub.id,
          title: sub.title,
          subtitle: sub.subtitle,
          image: sub.image,
          imageColor: undefined,
          titleColor: undefined,
          state: sub.state,
          attributes: {
            destructive: sub.destructive,
            disabled: sub.disabled,
            hidden: sub.hidden,
          },
        }))
      : undefined,
  }));

  return (
    <MenuView
      actions={transformedActions}
      onPressAction={handlePressAction}
      shouldOpenOnLongPress={shouldOpenOnLongPress}
      isAnchoredToRight={isAnchoredToRight}
    >
      {children}
    </MenuView>
  );
}
