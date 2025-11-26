import React, {useMemo} from 'react';
import {MenuView, type MenuAction} from '@react-native-menu/menu';
import {useTheme} from '@/providers';

export type NativeMenuAction = {
  id: string;
  title: string;
  subtitle?: string;
  destructive?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  keepsMenuPresented?: boolean;
  preferredElementSize?: 'small' | 'medium' | 'large';
  menuOptions?: {
    singleSelection?: boolean;
    destructive?: boolean;
    displayInline?: boolean;
  };
  state?: 'on' | 'off' | 'mixed';
  image?: string;
  displayInline?: boolean;
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
  const {theme} = useTheme();

  const handlePressAction = ({nativeEvent}: {nativeEvent: {event: string}}) => {
    onSelect(nativeEvent.event);
  };

  const transformedActions: MenuAction[] = useMemo(
    () =>
      actions.map((action) => ({
        id: action.id,
        title: action.title,
        subtitle: action.subtitle,
        image: action.image,
        imageColor: action.image ? theme.icon : theme.text,
        titleColor: undefined,
        state: action.state,
        displayInline: action.displayInline,
        preferredElementSize: action.preferredElementSize,
        menuOptions: action.menuOptions,
        attributes: {
          destructive: action.destructive,
          disabled: action.disabled,
          hidden: action.hidden,
          keepsMenuPresented: action.keepsMenuPresented,
        },
        subactions: action.subactions
          ? action.subactions.map((sub) => ({
              id: sub.id,
              title: sub.title,
              subtitle: sub.subtitle,
              image: sub.image,
              imageColor: sub.image ? theme.icon : theme.text,
              titleColor: undefined,
              state: sub.state,
              preferredElementSize: sub.preferredElementSize,
              menuOptions: sub.menuOptions,
              attributes: {
                destructive: sub.destructive,
                disabled: sub.disabled,
                hidden: sub.hidden,
                keepsMenuPresented: sub.keepsMenuPresented,
              },
            }))
          : undefined,
      })),
    [actions, theme.icon, theme.text],
  );

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
