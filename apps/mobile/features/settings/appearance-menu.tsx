import {useMemo, type RefObject} from 'react';
import type {View} from 'react-native';
import {ContextMenu, type ContextMenuItem} from '@/components/ui';
import {useTheme} from '@/providers';

type AppearanceMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  anchorRef?: RefObject<View | null>;
  containerRef?: RefObject<View | null>;
};

export function AppearanceMenu({
  isOpen,
  onClose,
  anchorRef,
  containerRef,
}: AppearanceMenuProps) {
  const {preference, setScheme} = useTheme();

  const menuItems: ContextMenuItem[] = useMemo(
    () => [
      {
        label: 'Light',
        onPress: () => setScheme('light'),
        isActive: preference === 'light',
      },
      {
        label: 'Dark',
        onPress: () => setScheme('dark'),
        isActive: preference === 'dark',
      },
      {
        label: 'System',
        onPress: () => setScheme('system'),
        isActive: preference === 'system',
      },
    ],
    [preference, setScheme],
  );

  return (
    <ContextMenu
      items={menuItems}
      isOpen={isOpen}
      onClose={onClose}
      anchorRef={anchorRef}
      containerRef={containerRef}
      variant="compact"
    />
  );
}
