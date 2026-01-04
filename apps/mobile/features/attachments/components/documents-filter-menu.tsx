import React, {useMemo, useCallback, useState} from 'react';
import {Platform} from 'react-native';
import {useAttachmentFilter, useSetAttachmentFilter} from '@sykamore/store';
import {SykaMenuView, type SykaMenuAction} from 'syka-menu';
import {HeaderButton} from '@/components/ui';

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
  const setAttachmentFilter = useSetAttachmentFilter();
  const [dateSortOrder, setDateSortOrder] = useState<'newest' | 'oldest'>(
    'newest',
  );

  const normalizedExtension = useMemo(
    () => attachmentFilter?.extension?.trim().toLowerCase() ?? null,
    [attachmentFilter?.extension],
  );

  const applyExtensionFilter = useCallback(
    (extension?: string) => {
      const baseFilter = {
        targetType: attachmentFilter?.targetType,
        targetId: attachmentFilter?.targetId,
        itemName: attachmentFilter?.itemName,
      };

      const hasBaseFilter = Boolean(
        baseFilter.targetType ?? baseFilter.targetId ?? baseFilter.itemName,
      );

      if (extension) {
        setAttachmentFilter({...baseFilter, extension});
        onExtensionChange?.(extension);
        return;
      }

      if (hasBaseFilter) {
        setAttachmentFilter(baseFilter);
      } else {
        setAttachmentFilter(null);
      }
      onExtensionChange?.(undefined);
    },
    [
      attachmentFilter?.itemName,
      attachmentFilter?.targetId,
      attachmentFilter?.targetType,
      onExtensionChange,
      setAttachmentFilter,
    ],
  );

  const handleExtensionSelect = useCallback(
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
        setDateSortOrder((prev) => (prev === 'newest' ? 'oldest' : 'newest'));
      }
    },
    [applyExtensionFilter],
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
              dateSortOrder === 'newest' ? 'Newest first' : 'Oldest first',
            image: Platform.select({
              ios: 'clock',
              android: 'outlined.AccessTime',
            }),
          },
          {
            id: 'Name',
            title: 'Name',
            subtitle: 'A to Z',
            image: Platform.select({
              ios: 'textformat',
              android: 'outlined.SortByAlpha',
            }),
          },
          // {
          //   id: 'size',
          //   title: 'Size',
          //   subtitle: 'Largest first',
          //   image: Platform.select({
          //     ios: 'externaldrive.badge.icloud',
          //     android: 'outlined.Sort',
          //   }),
          // },
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
            state: normalizedExtension ? ('off' as const) : ('on' as const),
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
  }, [normalizedExtension, dateSortOrder]);

  return (
    <SykaMenuView
      ripple={{mode: 'circle'}}
      actions={extensionMenuActions}
      onPressAction={({nativeEvent}) =>
        handleExtensionSelect(nativeEvent.event)
      }
      accessibilityLabel="Filter documents"
      accessibilityHint="Filter documents by file type"
    >
      <HeaderButton variant="more" />
    </SykaMenuView>
  );
}
