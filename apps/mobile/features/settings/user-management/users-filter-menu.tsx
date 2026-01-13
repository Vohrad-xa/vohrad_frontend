import React, {useMemo, useState, useCallback, useEffect} from 'react';
import {Platform} from 'react-native';
import {buildUserOrderBy, parseUserOrderBy} from '@sykamore/store';
import {useRouter} from 'expo-router';
import {SykaMenuView, type SykaMenuAction} from 'syka-menu';
import {HeaderButton} from '@/components/ui';
import {useRolesList} from '@/features/roles';
import {AppIcons} from '@/utils';
import {useSearchUsers, type UsersFilterOptions} from './use-search-users';
import type {OrderByDirection, UserSortKey} from '@sykamore/types';

type UsersFilterMenuProps = {
  searchQuery: string;
  onFilterControlChange?: (control: React.ReactNode) => void;
  children: (
    data: Pick<
      ReturnType<typeof useSearchUsers>,
      | 'users'
      | 'refresh'
      | 'hasNext'
      | 'onEndReached'
      | 'isLoading'
      | 'lastUpdated'
    > & {filterTrigger: React.ReactNode},
  ) => React.ReactNode;
};

export function UsersFilterMenu({
  searchQuery,
  onFilterControlChange,
  children,
}: UsersFilterMenuProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<UsersFilterOptions>({
    role: null,
  });
  const [odataOrderBy, setOdataOrderBy] = useState<string | undefined>();

  const {users, refresh, hasNext, onEndReached, isLoading, lastUpdated} =
    useSearchUsers({
      searchQuery,
      filters,
      odataOrderBy,
    });
  const {roles: availableRoles} = useRolesList();
  const [roleSourceUsers, setRoleSourceUsers] = useState(users);

  const activeSort = useMemo(
    () => parseUserOrderBy(odataOrderBy),
    [odataOrderBy],
  );

  const dateSortDirection =
    activeSort.key === 'date' ? activeSort.direction : 'desc';
  const nameSortDirection =
    activeSort.key === 'name' ? activeSort.direction : 'asc';

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

  const applySort = useCallback(
    (key: UserSortKey) => {
      const isActive = activeSort.key === key;
      const nextDirection: OrderByDirection = isActive
        ? activeSort.direction === 'asc'
          ? 'desc'
          : 'asc'
        : key === 'date'
          ? 'desc'
          : 'asc';

      setOdataOrderBy(buildUserOrderBy(key, nextDirection));
    },
    [activeSort, setOdataOrderBy],
  );

  const handleMenuSelect = useCallback(
    (id: string) => {
      if (id === 'all-roles') {
        setFilters((prev) => ({...prev, role: null}));
        return;
      }

      if (id.startsWith('role-')) {
        setFilters((prev) => ({...prev, role: id.replace('role-', '')}));
        return;
      }

      if (id === 'sort-date') {
        applySort('date');
        return;
      }

      if (id === 'sort-name') {
        applySort('name');
        return;
      }

      if (id === 'add-user') {
        router.push('/settings/users/add-user');
      }
    },
    [applySort, router],
  );

  const renderFilterControl = useMemo(() => {
    const trigger = <HeaderButton variant="more" />;

    const menuActions: SykaMenuAction[] = [
      {
        id: 'add-user',
        title: 'Add user',
        image: Platform.select({
          ios: AppIcons.actions.addUser,
          default: 'outlined.PersonAdd',
        }),
      },
      {
        id: 'sort-menu',
        title: 'Sort by',
        menuOptions: {displayInline: true},
        preferredElementSize: 'large',
        subactions: [
          {
            id: 'sort-date',
            title: 'Date',
            subtitle:
              dateSortDirection === 'desc' ? 'Newest first' : 'Oldest first',
            state:
              activeSort.key === 'date' ? ('on' as const) : ('off' as const),
            image: Platform.select({
              ios: 'clock',
              android: 'outlined.AccessTime',
            }),
          },
          {
            id: 'sort-name',
            title: 'Name',
            subtitle: nameSortDirection === 'asc' ? 'A to Z' : 'Z to A',
            state:
              activeSort.key === 'name' ? ('on' as const) : ('off' as const),
            image: Platform.select({
              ios: 'textformat',
              android: 'outlined.SortByAlpha',
            }),
          },
        ],
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
        ripple={{
          mode: 'circle',
        }}
        actions={menuActions}
        onPressAction={({nativeEvent}) => handleMenuSelect(nativeEvent.event)}
        accessibilityLabel="Filter users"
        accessibilityHint="Opens user filter menu"
      >
        {trigger}
      </SykaMenuView>
    );
  }, [
    roles,
    filters.role,
    handleMenuSelect,
    activeSort.key,
    dateSortDirection,
    nameSortDirection,
  ]);

  React.useEffect(() => {
    onFilterControlChange?.(renderFilterControl);
  }, [onFilterControlChange, renderFilterControl]);

  return children({
    users,
    refresh,
    hasNext,
    onEndReached,
    isLoading,
    lastUpdated,
    filterTrigger: renderFilterControl,
  });
}
