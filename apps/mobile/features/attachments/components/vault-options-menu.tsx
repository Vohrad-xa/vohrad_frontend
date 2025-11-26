import React, {useEffect, useState} from 'react';
import {Platform} from 'react-native';
import {
  HeaderButton,
  NativeMenu,
  PaperMenu,
  type NativeMenuAction,
} from '@/components/ui';
import {AppIcons, SFSymbols} from '@/utils';

interface VaultOptionsMenuProps {
  onSelect?: () => void;
  onScan?: () => void;
  onSortByName?: () => void;
  onSortByDate?: () => void;
  onSortBySize?: () => void;
  onFilterByItems?: () => void;
  onFilterByLocations?: () => void;
  onFilterByMaintenances?: () => void;
  sortBy?: 'name' | 'date' | 'size';
  filterByItems?: boolean;
  filterByLocations?: boolean;
  filterByMaintenances?: boolean;
}

export function VaultOptionsMenu({
  onSelect,
  onScan,
  onSortByName,
  onSortByDate,
  onSortBySize,
  onFilterByItems,
  onFilterByLocations,
  onFilterByMaintenances,
  sortBy = 'name',
  filterByItems = false,
  filterByLocations = false,
  filterByMaintenances = false,
}: VaultOptionsMenuProps) {
  const [sortSelection, setSortSelection] = useState(sortBy);
  const [resourceSelection, setResourceSelection] = useState<
    'items' | 'locations' | 'maintenances' | null
  >(() => {
    if (filterByItems) return 'items';
    if (filterByLocations) return 'locations';
    if (filterByMaintenances) return 'maintenances';
    return null;
  });

  useEffect(() => {
    setSortSelection(sortBy);
  }, [sortBy]);

  useEffect(() => {
    if (filterByItems) {
      setResourceSelection('items');
      return;
    }
    if (filterByLocations) {
      setResourceSelection('locations');
      return;
    }
    if (filterByMaintenances) {
      setResourceSelection('maintenances');
      return;
    }
    setResourceSelection(null);
  }, [filterByItems, filterByLocations, filterByMaintenances]);

  const resourceSubtitle =
    resourceSelection === 'items'
      ? 'Items'
      : resourceSelection === 'locations'
        ? 'Locations'
        : resourceSelection === 'maintenances'
          ? 'Maintenances'
          : undefined;

  const resourceState: NativeMenuAction['state'] =
    resourceSelection !== null ? 'on' : undefined;

  const menuActions: NativeMenuAction[] = [
    {
      id: 'action-group',
      title: '',
      displayInline: true,
      subactions: [
        {
          id: 'select',
          title: 'Select',
          image: Platform.select({
            ios: SFSymbols.checkmarkCircleOutline,
            default: AppIcons.actions.save,
          }),
        },
        {
          id: 'scan',
          title: 'Scan',
          image: Platform.select({
            ios: SFSymbols.camera,
            default: AppIcons.actions.scan,
          }),
        },
      ],
    },
    {
      id: 'sort-group',
      title: '',
      displayInline: true,
      subactions: [
        {
          id: 'sort-name',
          title: 'Name',
          state: sortSelection === 'name' ? 'on' : 'off',
        },
        {
          id: 'sort-date',
          title: 'Date',
          state: sortSelection === 'date' ? 'on' : 'off',
        },
        {
          id: 'sort-size',
          title: 'Size',
          state: sortSelection === 'size' ? 'on' : 'off',
        },
      ],
    },
    {
      id: 'resource',
      title: 'Resource',
      subtitle: resourceSubtitle,
      state: resourceState,
      menuOptions: {singleSelection: true},
      keepsMenuPresented: true,
      subactions: [
        {
          id: 'resource-items',
          title: 'Items',
          state: resourceSelection === 'items' ? 'on' : 'off',
          keepsMenuPresented: true,
        },
        {
          id: 'resource-locations',
          title: 'Locations',
          state: resourceSelection === 'locations' ? 'on' : 'off',
          keepsMenuPresented: true,
        },
        {
          id: 'resource-maintenances',
          title: 'Maintenances',
          state: resourceSelection === 'maintenances' ? 'on' : 'off',
          keepsMenuPresented: true,
        },
      ],
    },
  ];

  const handleSelect = (actionId: string) => {
    switch (actionId) {
      case 'select':
        onSelect?.();
        break;
      case 'scan':
        onScan?.();
        break;
      case 'sort-name':
        setSortSelection('name');
        onSortByName?.();
        break;
      case 'sort-date':
        setSortSelection('date');
        onSortByDate?.();
        break;
      case 'sort-size':
        setSortSelection('size');
        onSortBySize?.();
        break;
      case 'resource-items':
        setResourceSelection('items');
        onFilterByItems?.();
        break;
      case 'resource-locations':
        setResourceSelection('locations');
        onFilterByLocations?.();
        break;
      case 'resource-maintenances':
        setResourceSelection('maintenances');
        onFilterByMaintenances?.();
        break;
    }
  };

  const MenuComponent = Platform.OS === 'web' ? PaperMenu : NativeMenu;

  return (
    <MenuComponent actions={menuActions} onSelect={handleSelect}>
      <HeaderButton variant="more" accessibilityLabel="Vault options" />
    </MenuComponent>
  );
}
