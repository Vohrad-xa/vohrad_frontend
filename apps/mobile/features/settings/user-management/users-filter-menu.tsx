import React, {useMemo, useState, useCallback, useEffect} from 'react';
import {Platform} from 'react-native';
import {SykaMenuView, type SykaMenuAction} from 'syka-menu';
import {HeaderButton} from '@/components/ui';
import {useRolesList} from '@/features/roles';
import {AppIcons} from '@/utils';
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

  const {users, refresh, hasNext, onEndReached} = useSearchUsers({
    searchQuery,
    filters,
  });
  const {roles: availableRoles} = useRolesList();
  const [roleSourceUsers, setRoleSourceUsers] = useState(users);

  useEffect(() => {
    if (filters.role === null) {
      setRoleSourceUsers(users);
    }
  }, [filters.role, users]);

  const roles = useMemo(() => {
    const roleSet = new Set<string>();
    if (availableRoles.length > 0) {
      availableRoles.forEach((role) => {
        if (role.name) roleSet.add(role.name);
      });
    } else {
      roleSourceUsers.forEach((user) => {
        if (user.role) roleSet.add(user.role);
      });
    }
    if (filters.role) {
      roleSet.add(filters.role);
    }
    return Array.from(roleSet).sort();
  }, [availableRoles, filters.role, roleSourceUsers]);

  const handleSelect = useCallback((id: string) => {
    if (id === 'all-roles') {
      setFilters((prev) => ({...prev, role: null}));
    } else if (id.startsWith('role-')) {
      setFilters((prev) => ({...prev, role: id.replace('role-', '')}));
    }
  }, []);

  const renderFilterControl = useMemo(() => {
    const trigger = (
      <HeaderButton
        icon={AppIcons.ui.filter}
        accessibilityLabel="Filter users"
      />
    );

    const menuActions: SykaMenuAction[] = [
      {
        id: 'select-user',
        title: 'Select',
        image: Platform.select({
          ios: AppIcons.actions.select,
          default: 'outlined.Info',
        }),
      },
      {
        id: 'roles-group',
        title: 'Filter by Role',
        menuOptions: {displayInline: true},
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
    ];

    return (
      <SykaMenuView
        actions={menuActions}
        onPressAction={({nativeEvent}) => handleSelect(nativeEvent.event)}
      >
        {trigger}
      </SykaMenuView>
    );
  }, [roles, filters.role, handleSelect]);

  React.useEffect(() => {
    onFilterControlChange?.(renderFilterControl);
  }, [onFilterControlChange, renderFilterControl]);

  return children({
    users,
    refresh,
    hasNext,
    onEndReached,
    filterTrigger: renderFilterControl,
  });
}
