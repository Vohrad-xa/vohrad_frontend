import React, {useMemo, useCallback} from 'react';
import {Platform} from 'react-native';
import {
  buildAttachmentOrderBy,
  getAttachmentExtension,
  hasAttachmentExtension,
  parseAttachmentOrderBy,
  useAttachmentFilter,
  useUpdateAttachmentFilter,
} from '@sykamore/store';
import {SykaMenuView, type SykaMenuAction} from 'syka-menu';
import {HeaderButton} from '@/components/ui';
import type {AttachmentSortKey, OrderByDirection} from '@sykamore/types';

type DocumentsFilterMenuProps = {
  onExtensionChange?: (extension: string | undefined) => void;
};

/**
 * Header trigger for filtering documents by file extension.
 *
 * - Lives under attachments components to stay reusable across screens
 * - Emits selected extension and mirrors into the global attachment filter
 */
export function DocumentsFilterMenu({
  onExtensionChange,
}: DocumentsFilterMenuProps) {
  const attachmentFilter = useAttachmentFilter();
  const updateAttachmentFilter = useUpdateAttachmentFilter();

  const normalizedExtension = getAttachmentExtension(attachmentFilter);
  const hasExtensionFilter = hasAttachmentExtension(attachmentFilter);

  const activeSort = useMemo(
    () => parseAttachmentOrderBy(attachmentFilter?.odataOrderBy),
    [attachmentFilter?.odataOrderBy],
  );

  const dateSortDirection =
    activeSort.key === 'date' ? activeSort.direction : 'desc';
  const nameSortDirection =
    activeSort.key === 'name' ? activeSort.direction : 'asc';

  const applyExtensionFilter = useCallback(
    (extension?: string) => {
      if (extension) {
        updateAttachmentFilter({extension});
        onExtensionChange?.(extension);
        return;
      }

      updateAttachmentFilter((prev) => {
        if (!prev) {
          return null;
        }

        const {extension: _extension, ...rest} = prev;
        return rest;
      });
      onExtensionChange?.(undefined);
    },
    [onExtensionChange, updateAttachmentFilter],
  );

  const applySort = useCallback(
    (key: AttachmentSortKey) => {
      const isActive = activeSort.key === key;
      const nextDirection: OrderByDirection = isActive
        ? activeSort.direction === 'asc'
          ? 'desc'
          : 'asc'
        : key === 'date'
          ? 'desc'
          : 'asc';

      updateAttachmentFilter({
        odataOrderBy: buildAttachmentOrderBy(key, nextDirection),
      });
    },
    [activeSort, updateAttachmentFilter],
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
      }
    },
    [applyExtensionFilter, applySort],
  );

  const extensionMenuActions = useMemo((): SykaMenuAction[] => {
    const presets = ['pdf', 'docx', 'xlsx', 'csv', 'txt'];
    return [
      {
        title: 'sorted by',
        menuOptions: {displayInline: true},
        id: 'sort-menu',
        preferredElementSize: 'large',
        subactions: [
          {
            id: 'date',
            title: 'Date                           ',
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
            id: 'name',
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
        id: 'extensions-menu',
        title: 'Filter by type',
        menuOptions: {displayInline: true},
        subactions: [
          {
            id: 'ext-all',
            title: 'All types',
            state: hasExtensionFilter ? ('off' as const) : ('on' as const),
          },
          ...presets.map((ext) => ({
            id: `ext-${ext}`,
            title: ext,
            state:
              normalizedExtension === ext ? ('on' as const) : ('off' as const),
          })),
        ],
      },
    ];
  }, [
    activeSort.key,
    dateSortDirection,
    nameSortDirection,
    hasExtensionFilter,
    normalizedExtension,
  ]);

  return (
    <SykaMenuView
      ripple={{mode: 'circle'}}
      actions={extensionMenuActions}
      onPressAction={({nativeEvent}) => handleMenuSelect(nativeEvent.event)}
      accessibilityLabel="Filter documents"
      accessibilityHint="Filter documents by file type"
    >
      <HeaderButton variant="more" />
    </SykaMenuView>
  );
}
