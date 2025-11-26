import React from 'react';
import {Platform} from 'react-native';
import {
  HeaderButton,
  NativeMenu,
  PaperMenu,
  type NativeMenuAction,
} from '@/components/ui';
import {AppIcons, SFSymbols} from '@/utils';

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
  const menuActions: NativeMenuAction[] = [
    {
      id: 'add-document',
      title: 'Add Document',
      image: Platform.select({
        ios: SFSymbols.plusCircle,
        default: AppIcons.actions.add,
      }),
    },
    {
      id: 'scan-document',
      title: 'Scan Document',
      image: Platform.select({
        ios: SFSymbols.camera,
        default: AppIcons.actions.camera,
      }),
    },
    {
      id: 'filter',
      title: 'Filter',
      image: Platform.select({
        ios: SFSymbols.lineHorizontalFilter,
        default: AppIcons.navigation.filter,
      }),
      subactions: [
        {
          id: 'filter-images',
          title: 'Images',
          image: Platform.select({
            ios: SFSymbols.photo,
            default: AppIcons.content.image,
          }),
        },
        {
          id: 'filter-documents',
          title: 'Documents',
          image: Platform.select({
            ios: SFSymbols.docText,
            default: AppIcons.content.document,
          }),
        },
        {
          id: 'filter-archives',
          title: 'Archives',
          image: Platform.select({
            ios: SFSymbols.archivebox,
            default: AppIcons.content.archive,
          }),
        },
        {
          id: 'filter-other',
          title: 'Other',
          image: Platform.select({
            ios: SFSymbols.doc,
            default: AppIcons.content.file,
          }),
        },
      ],
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
      case 'filter':
        onFilter?.();
        break;
      case 'filter-images':
      case 'filter-documents':
      case 'filter-archives':
      case 'filter-other':
        // Handle filter submenu selections
        onFilter?.();
        break;
    }
  };

  const MenuComponent = Platform.OS === 'web' ? PaperMenu : NativeMenu;

  return (
    <MenuComponent actions={menuActions} onSelect={handleSelect}>
      <HeaderButton variant="more" accessibilityLabel="Vault actions" />
    </MenuComponent>
  );
}
