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
import {useTheme} from '@/providers';
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
  const {theme} = useTheme();

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

      if (actionId === 'select') {
        onSelectPress?.();
      }
    },
    [applyExtensionFilter, applySort, onSelectPress],
  );

  const menuActions = useMemo((): SykaMenuAction[] => {
    const presets = ['docx', 'xlsx', 'csv', 'txt', 'pdf'];
    const extensionColors: Record<string, string> = {
      pdf: theme.accentRed,
      docx: theme.accentBlue,
      xlsx: theme.accentGreen,
      csv: theme.text,
      txt: theme.icon,
    };
    const actions: SykaMenuAction[] = [
      {
        title: 'sorted by',
        menuOptions: {displayInline: true},
        id: 'sort-menu',
        subactions: [
          {
            id: 'date',
            title: 'Date',
            subtitle:
              dateSortDirection === 'desc' ? 'Newest first' : 'Oldest first',
            state:
              activeSort.key === 'date' ? ('on' as const) : ('off' as const),
            image: Platform.select({
              ios: 'clock',
              android: undefined,
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
              android: undefined,
            }),
          },
          {
            id: 'size',
            title: 'Size',
            subtitle:
              sizeSortDirection === 'desc' ? 'Largest first' : 'Smallest first',
            state:
              activeSort.key === 'size' ? ('on' as const) : ('off' as const),
            image: Platform.select({
              ios: 'externaldrive.badge.icloud',
              android: undefined,
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
              android: 'outlined.FolderOpen',
            }),
            state: hasExtensionFilter ? ('off' as const) : ('on' as const),
          },
          ...presets.map((ext) => ({
            id: `ext-${ext}`,
            title: ext,
            image: Platform.select({
              ios: 'doc.text',
              android: 'outlined.Description',
            }),
            imageColor: extensionColors[ext] ?? theme.icon,
            androidTitleColor:
              Platform.OS === 'android'
                ? (extensionColors[ext] ?? theme.icon)
                : undefined,
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
    theme.accentBlue,
    theme.accentGreen,
    theme.accentRed,
    theme.icon,
    theme.text,
  ]);

  const accessibilityLabel = showExtensionFilter
    ? 'Filter attachments'
    : 'Sort attachments';
  const accessibilityHint = showExtensionFilter
    ? 'Filter attachments by file type or sort order'
    : 'Sort attachments by date, name, or size';

  return (
    <SykaMenuView
      ripple={{mode: 'circle'}}
      actions={menuActions}
      onPressAction={({nativeEvent}) => handleMenuSelect(nativeEvent.event)}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
    >
      <HeaderButton variant="more" />
    </SykaMenuView>
  );
}
