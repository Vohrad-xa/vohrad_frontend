import React from 'react';
import {Platform} from 'react-native';
import {SykaMenuView, type SykaMenuAction} from 'syka-menu';
import {HeaderButton} from '@/components/ui';
import {useTheme} from '@/providers';
import {AppIcons} from '@/utils';

interface VaultActionsMenuProps {
  onAddDocument: () => void;
  onScanDocument?: () => void;
  onFilter?: () => void;
}

export function VaultActionsMenu({
  onAddDocument,
  onScanDocument,
  onFilter,
}: VaultActionsMenuProps) {
  const {theme} = useTheme();

  const menuActions: SykaMenuAction[] = [
    {
      id: 'add-document',
      title: 'Add Document',

      image: Platform.select({
        ios: AppIcons.actions.add,
      }),
      subtitle: 'Upload documents to your vault.',
    },
    {
      id: 'scan-document',
      title: 'Scan Document',
      image: Platform.select({
        ios: AppIcons.actions.scan,
      }),
    },
  ];

  const handleSelect = (actionId: string) => {
    switch (actionId) {
      case 'add-document':
        onAddDocument();
        break;
      case 'scan-document':
        onScanDocument?.();
        break;
      case 'filter-images':
      case 'filter-documents':
      case 'filter-archives':
      case 'filter-other':
        onFilter?.();
        break;
    }
  };

  return (
    <SykaMenuView
      title="menu"
      actions={menuActions}
      onPressAction={({nativeEvent}) => handleSelect(nativeEvent.event)}
    >
      <HeaderButton
        variant="more"
        accessibilityLabel="Vault actions"
        isMenuTrigger
      />
    </SykaMenuView>
  );
}
