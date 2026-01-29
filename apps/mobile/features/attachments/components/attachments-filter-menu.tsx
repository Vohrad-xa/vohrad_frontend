import React, {useMemo, useCallback} from 'react';
import {Platform} from 'react-native';
import {
  buildAttachmentOrderBy,
  getAttachmentExtension,
  hasAttachmentExtension,
  parseAttachmentOrderBy,
} from '@sykamore/store';
import {SykaMenuView, type SykaMenuAction} from 'syka-menu';
import {HeaderButton} from '@/components/ui';
import type {AttachmentSortKey, OrderByDirection} from '@sykamore/types';

type AttachmentsFilterMenuProps = {
  showExtensionFilter?: boolean;
  extension?: string | null;
  odataOrderBy?: string;
  onExtensionChange?: (extension: string | undefined) => void;
  onOrderByChange?: (orderBy: string | undefined) => void;
  onSelectPress?: () => void;
};

/**
 * Attachment menu for sorting (and optionally filtering by file extension).
 *
 * - Extension filter is hidden when not supported by the screen
 * - Emits local extension/orderby selections to the parent
 */
export function AttachmentsFilterMenu({
  showExtensionFilter = true,
  extension,
  odataOrderBy,
  onExtensionChange,
  onOrderByChange,
  onSelectPress,
}: AttachmentsFilterMenuProps) {
  const normalizedExtension = useMemo(
    () => getAttachmentExtension(extension ? {extension} : null),
    [extension],
  );
  const hasExtensionFilter = useMemo(
    () => hasAttachmentExtension(extension ? {extension} : null),
    [extension],
  );

  const activeSort = useMemo(
    () => parseAttachmentOrderBy(odataOrderBy),
    [odataOrderBy],
  );

  const dateSortDirection =
    activeSort.key === 'date' ? activeSort.direction : 'desc';
  const nameSortDirection =
    activeSort.key === 'name' ? activeSort.direction : 'asc';
  const sizeSortDirection =
    activeSort.key === 'size' ? activeSort.direction : 'desc';

  const applyExtensionFilter = useCallback(
    (nextExtension?: string) => {
      const normalized = nextExtension?.trim().toLowerCase();
      if (!normalized) {
        onExtensionChange?.(undefined);
        return;
      }
      onExtensionChange?.(normalized);
    },
    [onExtensionChange],
  );

  const applySort = useCallback(
    (key: AttachmentSortKey) => {
      const isActive = activeSort.key === key;
      const nextDirection: OrderByDirection = isActive
        ? activeSort.direction === 'asc'
          ? 'desc'
          : 'asc'
        : key === 'date' || key === 'size'
          ? 'desc'
          : 'asc';

      const orderBy = buildAttachmentOrderBy(key, nextDirection);
      onOrderByChange?.(orderBy);
    },
    [activeSort, onOrderByChange],
  );

  const applySortDirection = useCallback(
    (key: AttachmentSortKey, direction: OrderByDirection) => {
      const orderBy = buildAttachmentOrderBy(key, direction);
      onOrderByChange?.(orderBy);
    },
    [onOrderByChange],
  );

  const handleMenuSelect = useCallback(
    (actionId: string) => {
      if (actionId === 'ext-all') {
        applyExtensionFilter(undefined);
        return;
      }

      if (actionId.startsWith('ext-')) {
        const nextExtension = actionId.replace('ext-', '');
        applyExtensionFilter(nextExtension);
        return;
      }

      if (actionId === 'date') {
        applySort('date');
        return;
      }

      if (actionId === 'name') {
        applySort('name');
        return;
      }

      if (actionId === 'size') {
        applySort('size');
        return;
      }

      if (actionId === 'date-asc') {
        applySortDirection('date', 'asc');
        return;
      }

      if (actionId === 'date-desc') {
        applySortDirection('date', 'desc');
        return;
      }

      if (actionId === 'name-asc') {
        applySortDirection('name', 'asc');
        return;
      }

      if (actionId === 'name-desc') {
        applySortDirection('name', 'desc');
        return;
      }

      if (actionId === 'size-asc') {
        applySortDirection('size', 'asc');
        return;
      }

      if (actionId === 'size-desc') {
        applySortDirection('size', 'desc');
        return;
      }

      if (actionId === 'select') {
        onSelectPress?.();
      }
    },
    [applyExtensionFilter, applySort, applySortDirection, onSelectPress],
  );

  const menuActions = useMemo((): SykaMenuAction[] => {
    const presets = ['docx', 'xlsx', 'csv', 'txt', 'pdf'];
    const isAndroid = Platform.OS === 'android';
    const actions: SykaMenuAction[] = isAndroid
      ? [
          {
            title: 'Sort by',
            menuOptions: {displayInline: true},
            id: 'sort-menu',
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
              {
                id: 'sort-size',
                title: 'Size',
                subactions: [
                  {
                    id: 'size-desc',
                    title: 'Largest first',
                    state: sizeSortDirection === 'desc' ? 'on' : 'off',
                  },
                  {
                    id: 'size-asc',
                    title: 'Smallest first',
                    state: sizeSortDirection === 'asc' ? 'on' : 'off',
                  },
                ],
              },
            ],
          },
        ]
      : [
          {
            title: 'sorted by',
            menuOptions: {displayInline: true},
            id: 'sort-menu',
            subactions: [
              {
                id: 'date',
                title: 'Date',
                subtitle:
                  dateSortDirection === 'desc'
                    ? 'Newest first'
                    : 'Oldest first',
                state:
                  activeSort.key === 'date'
                    ? ('on' as const)
                    : ('off' as const),
                image: Platform.select({
                  ios: 'clock',
                }),
              },
              {
                id: 'name',
                title: 'Name',
                subtitle: nameSortDirection === 'asc' ? 'A to Z' : 'Z to A',
                state:
                  activeSort.key === 'name'
                    ? ('on' as const)
                    : ('off' as const),
                image: Platform.select({
                  ios: 'textformat',
                }),
              },
              {
                id: 'size',
                title: 'Size',
                subtitle:
                  sizeSortDirection === 'desc'
                    ? 'Largest first'
                    : 'Smallest first',
                state:
                  activeSort.key === 'size'
                    ? ('on' as const)
                    : ('off' as const),
                image: Platform.select({
                  ios: 'externaldrive.badge.icloud',
                }),
              },
            ],
          },
        ];

    if (showExtensionFilter) {
      actions.push({
        id: 'extensions-menu',
        title: 'Filter by type',
        menuOptions: {displayInline: true},
        subactions: [
          {
            id: 'ext-all',
            title: 'All types',
            image: Platform.select({
              ios: 'folder',
            }),
            state: hasExtensionFilter ? ('off' as const) : ('on' as const),
          },
          ...presets.map((ext) => ({
            id: `ext-${ext}`,
            title: ext,
            image: Platform.select({
              ios: 'doc.text',
            }),
            state:
              normalizedExtension === ext ? ('on' as const) : ('off' as const),
          })),
        ],
      });
    }
    if (onSelectPress) {
      actions.unshift({
        id: 'select',
        title: 'Select',
        image: Platform.select({
          ios: 'checkmark.circle',
          android: undefined,
        }),
      });
    }

    return actions;
  }, [
    activeSort.key,
    dateSortDirection,
    nameSortDirection,
    sizeSortDirection,
    hasExtensionFilter,
    normalizedExtension,
    showExtensionFilter,
    onSelectPress,
  ]);

  const accessibilityLabel = showExtensionFilter
    ? 'Filter attachments'
    : 'Sort attachments';
  const accessibilityHint = showExtensionFilter
    ? 'Filter attachments by file type or sort order'
    : 'Sort attachments by date, name, or size';

  return (
    <SykaMenuView
      actions={menuActions}
      onPressAction={({nativeEvent}) => handleMenuSelect(nativeEvent.event)}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
    >
      <HeaderButton variant="more" isMenuTrigger />
    </SykaMenuView>
  );
}
