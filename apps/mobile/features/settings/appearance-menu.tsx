import {useMemo, type ReactNode} from 'react';
import {NativeMenu, type NativeMenuAction} from '@/components/ui';
import {useTheme} from '@/providers';

type AppearanceMenuProps = {
  children: ReactNode;
};

export function AppearanceMenu({children}: AppearanceMenuProps) {
  const {preference, setScheme} = useTheme();

  const menuActions: NativeMenuAction[] = useMemo(
    () => [
      {
        id: 'light',
        title: 'Light',
        state: preference === 'light' ? 'on' : undefined,
      },
      {
        id: 'dark',
        title: 'Dark',
        state: preference === 'dark' ? 'on' : undefined,
      },
      {
        id: 'system',
        title: 'System',
        state: preference === 'system' ? 'on' : undefined,
      },
    ],
    [preference],
  );

  const handleSelect = (actionId: string) => {
    setScheme(actionId as 'light' | 'dark' | 'system');
  };

  return (
    <NativeMenu actions={menuActions} onSelect={handleSelect} isAnchoredToRight>
      {children}
    </NativeMenu>
  );
}
