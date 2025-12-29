import * as React from 'react';
import {type ViewStyle} from 'react-native';
import {Menu, Divider} from 'react-native-paper';
import {useTheme} from '@/providers';
import type {SykaMenuAction} from 'syka-menu';

type PaperMenuBaseProps = {
  actions: SykaMenuAction[];
  onSelect: (actionId: string) => void;
  children: React.ReactNode;
};

export interface PaperMenuProps extends PaperMenuBaseProps {
  anchorPosition?: 'top' | 'bottom';
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;
  mode?: 'flat' | 'elevated';
  contentStyle?: ViewStyle;
  menuStyle?: ViewStyle;
}

export function PaperMenu({
  actions,
  onSelect,
  children,
  anchorPosition = 'bottom',
  elevation = 2,
  mode = 'elevated',
  contentStyle: customContentStyle,
  menuStyle,
}: PaperMenuProps) {
  const [visible, setVisible] = React.useState(false);
  const {theme, ds} = useTheme();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleAction = (actionId: string) => {
    onSelect(actionId);
    closeMenu();
  };

  const contentStyle = {
    backgroundColor: theme.input,
    minWidth: 240,
    paddingVertical: 0,
    ...customContentStyle,
  };

  const anchorElement = React.cloneElement(
    React.Children.only(children) as React.ReactElement<{onPress?: () => void}>,
    {onPress: openMenu},
  );

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={anchorElement}
      contentStyle={contentStyle}
      style={menuStyle}
      anchorPosition={anchorPosition}
      elevation={elevation}
      mode={mode}
    >
      {actions.map((action, index) => {
        const {attributes} = action;
        if (attributes?.hidden) return null;

        const items = [];
        const actionId = action.id;
        if (action.menuOptions?.displayInline && index > 0) {
          items.push(<Divider key={`divider-${actionId ?? index}`} />);
        }

        if (!actionId) {
          return items.length ? items : null;
        }

        items.push(
          <Menu.Item
            key={actionId}
            onPress={() => handleAction(actionId)}
            title={action.title}
            disabled={attributes?.disabled}
            leadingIcon={action.image}
            rippleColor={theme.card}
            titleStyle={{
              color: attributes?.destructive ? theme.destructive : theme.text,
              fontSize: ds.typography.body.fontSize,
              fontWeight: ds.fontWeight.medium,
            }}
          />,
        );

        return items;
      })}
    </Menu>
  );
}
