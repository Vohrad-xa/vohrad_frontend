import React, {useMemo, useState, useCallback, useLayoutEffect} from 'react';
import {Platform} from 'react-native';
import {
  buildUserOrderBy,
  parseUserOrderBy,
  type UserRoleFilter,
} from '@sykamore/store';
import {useNavigation, useRouter} from 'expo-router';
import {SykaMenuView, type SykaMenuAction} from 'syka-menu';
import {HeaderButton} from '@/components/ui';
import {useActiveRolesList} from '@/features/roles';
import {AppIcons} from '@/utils';
import {
  useSearchUsers,
  type UsersFilterOptions,
} from '../hooks/use-search-users';
import type {OrderByDirection, UserSortKey} from '@sykamore/types';

type UsersFilterMenuProps = {
  searchQuery: string;
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

function sortRoleFilters(filters: UserRoleFilter[]): UserRoleFilter[] {
  return [...filters].sort((left, right) =>
    left.name.localeCompare(right.name),
  );
}

export function UsersFilterMenu({searchQuery, children}: UsersFilterMenuProps) {
  const navigation = useNavigation();
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
  const {roles: activeRoles} = useActiveRolesList();

  const activeSort = useMemo(
    () => parseUserOrderBy(odataOrderBy),
    [odataOrderBy],
  );

  const dateSortDirection =
    activeSort.key === 'date' ? activeSort.direction : 'desc';
  const nameSortDirection =
    activeSort.key === 'name' ? activeSort.direction : 'asc';

  const roleFilters = useMemo(() => {
    const roles = activeRoles
      .filter((role) => Boolean(role.id && role.name))
      .map((role) => ({
        id: role.id,
        name: role.name,
      }));

    if (!filters.role) {
      return sortRoleFilters(roles);
    }

    const hasSelectedRole = roles.some((role) => role.id === filters.role?.id);
    return sortRoleFilters(hasSelectedRole ? roles : [...roles, filters.role]);
  }, [activeRoles, filters.role]);

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
    [activeSort],
  );

  const applySortDirection = useCallback(
    (key: UserSortKey, direction: OrderByDirection) => {
      setOdataOrderBy(buildUserOrderBy(key, direction));
    },
    [],
  );

  const handleMenuSelect = useCallback(
    (id: string) => {
      if (id === 'all-roles') {
        setFilters((prev) => ({...prev, role: null}));
        return;
      }

      if (id.startsWith('role-')) {
        const roleId = id.replace('role-', '');
        const selectedRole =
          roleFilters.find((role) => role.id === roleId) ?? null;
        setFilters((prev) => ({...prev, role: selectedRole}));
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

      if (id === 'date-asc') {
        applySortDirection('date', 'asc');
        return;
      }

      if (id === 'date-desc') {
        applySortDirection('date', 'desc');
        return;
      }

      if (id === 'name-asc') {
        applySortDirection('name', 'asc');
        return;
      }

      if (id === 'name-desc') {
        applySortDirection('name', 'desc');
        return;
      }

      if (id === 'add-user') {
        router.push('/settings/tenant/users/add-user');
      }
    },
    [applySort, applySortDirection, roleFilters, router],
  );

  const renderFilterControl = useMemo(() => {
    const trigger = <HeaderButton variant="more" isMenuTrigger />;
    const isAndroid = Platform.OS === 'android';

    const sortMenuAction: SykaMenuAction = isAndroid
      ? {
          id: 'sort-menu',
          title: 'Sort by',
          menuOptions: {displayInline: true},
          preferredElementSize: 'large',
          subactions: [
            {
              id: 'sort-date',
              title: 'Date',
              subactions: [
                {
                  id: 'date-desc',
                  title: 'Newest first',
                  state: dateSortDirection === 'desc' ? 'on' : 'off',
                },
                {
                  id: 'date-asc',
                  title: 'Oldest first',
                  state: dateSortDirection === 'asc' ? 'on' : 'off',
                },
              ],
            },
            {
              id: 'sort-name',
              title: 'Name',
              subactions: [
                {
                  id: 'name-asc',
                  title: 'A to Z',
                  state: nameSortDirection === 'asc' ? 'on' : 'off',
                },
                {
                  id: 'name-desc',
                  title: 'Z to A',
                  state: nameSortDirection === 'desc' ? 'on' : 'off',
                },
              ],
            },
          ],
        }
      : {
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
              }),
            },
          ],
        };

    const menuActions: SykaMenuAction[] = [
      {
        id: 'add-user',
        title: 'Add user',
        image: Platform.select({
          ios: AppIcons.actions.addUser,
        }),
      },
      sortMenuAction,
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
          ...roleFilters.map((role) => ({
            id: `role-${role.id}`,
            title: role.name,
            state:
              filters.role?.id === role.id ? ('on' as const) : ('off' as const),
          })),
        ],
      },
    ];

    return (
      <SykaMenuView
        actions={menuActions}
        onPressAction={({nativeEvent}) => handleMenuSelect(nativeEvent.event)}
      >
        {trigger}
      </SykaMenuView>
    );
  }, [
    activeSort.key,
    dateSortDirection,
    filters.role,
    handleMenuSelect,
    nameSortDirection,
    roleFilters,
  ]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => renderFilterControl,
    });
  }, [navigation, renderFilterControl]);

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
