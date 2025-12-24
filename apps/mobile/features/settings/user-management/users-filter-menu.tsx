import React, {useMemo, useState, useCallback} from 'react';
import {Platform} from 'react-native';
import {
  HeaderButton,
  NativeMenu,
  PaperMenu,
  type NativeMenuAction,
} from '@/components/ui';
import {AppIcons, sortByDate, type SortOrder} from '@/utils';
import {useSearchUsers, type UsersFilterOptions} from './use-search-users';

type UsersFilterMenuProps = {
  searchQuery: string;
  onFilterControlChange?: (control: React.ReactNode) => void;
  children: (
    data: Pick<
      ReturnType<typeof useSearchUsers>,
      'users' | 'refresh' | 'hasNext' | 'onEndReached'
    > & {filterTrigger: React.ReactNode},
  ) => React.ReactNode;
};

export function UsersFilterMenu({
  searchQuery,
  onFilterControlChange,
  children,
}: UsersFilterMenuProps) {
  const [filters, setFilters] = useState<UsersFilterOptions>({
    role: null,
    createdFrom: null,
    createdTo: null,
  });
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const {users, refresh, hasNext, onEndReached} = useSearchUsers({
    searchQuery,
    filters,
  });

  const sortedUsers = useMemo(() => {
    return sortByDate(users, 'created_at', sortOrder);
  }, [sortOrder, users]);

  const roles = useMemo(() => {
    const roleSet = new Set<string>();
    users.forEach((user) => {
      if (user.role) roleSet.add(user.role);
    });
    return Array.from(roleSet).sort();
  }, [users]);

  const handleSelect = useCallback((id: string) => {
    if (id === 'all-roles') {
      setFilters((prev) => ({...prev, role: null}));
    } else if (id.startsWith('role-')) {
      setFilters((prev) => ({...prev, role: id.replace('role-', '')}));
    } else if (id === 'asc' || id === 'desc') {
      setSortOrder(id);
    }
  }, []);

  const renderFilterControl = useMemo(() => {
    const trigger = (
      <HeaderButton
        icon={AppIcons.ui.filter}
        accessibilityLabel="Filter users"
      />
    );

    // menu/menu for iOS and Android
    const nativeMenuActions: NativeMenuAction[] = [
      {
        id: 'select-user',
        title: 'Select',
        image: Platform.select({
          ios: AppIcons.actions.select,
          default: AppIcons.files.file,
        }),
      },
      {
        id: 'roles-group',
        title: 'Filters',
        displayInline: true,
        subactions: [
          {
            id: 'all-roles',
            title: 'All Roles',
            state: filters.role === null ? 'on' : 'off',
          },
          ...roles.map((role) => ({
            id: `role-${role}`,
            title: role,
            state: filters.role === role ? ('on' as const) : ('off' as const),
          })),
        ],
      },
      {
        id: 'sort-group',
        title: 'Sort By',
        displayInline: true,
        subactions: [
          {
            id: 'asc',
            title: 'Oldest First',
            state: sortOrder === 'asc' ? ('on' as const) : ('off' as const),
          },
          {
            id: 'desc',
            title: 'Newest First',
            state: sortOrder === 'desc' ? ('on' as const) : ('off' as const),
          },
        ],
      },
    ];

    // Paper Menu for web
    const paperActions = [
      {
        id: 'all-roles',
        title: 'All Roles',
        state: filters.role === null ? ('on' as const) : undefined,
      },
      ...roles.map((role) => ({
        id: `role-${role}`,
        title: role,
        state: filters.role === role ? ('on' as const) : undefined,
      })),
      {
        id: 'divider-sort',
        title: '',
        displayInline: true,
        disabled: true,
        hidden: true,
      },
      {
        id: 'asc',
        title: 'Oldest First',
        displayInline: true,
        state: sortOrder === 'asc' ? ('on' as const) : undefined,
      },
      {
        id: 'desc',
        title: 'Newest First',
        state: sortOrder === 'desc' ? ('on' as const) : undefined,
      },
    ];

    const MenuComponent = Platform.OS === 'web' ? PaperMenu : NativeMenu;
    const menuActions =
      Platform.OS === 'web' ? paperActions : nativeMenuActions;

    return (
      <MenuComponent actions={menuActions} onSelect={handleSelect}>
        {trigger}
      </MenuComponent>
    );
  }, [roles, filters.role, sortOrder, handleSelect]);

  React.useEffect(() => {
    onFilterControlChange?.(renderFilterControl);
  }, [onFilterControlChange, renderFilterControl]);

  return children({
    users: sortedUsers,
    refresh,
    hasNext,
    onEndReached,
    filterTrigger: renderFilterControl,
  });
}
