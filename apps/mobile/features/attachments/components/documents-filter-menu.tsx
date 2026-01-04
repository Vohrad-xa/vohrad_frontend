import React, {useMemo, useCallback} from 'react';
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
      }
    },
    [applyExtensionFilter],
  );

  const extensionMenuActions = useMemo((): SykaMenuAction[] => {
    const presets = ['pdf', 'docx', 'xlsx', 'csv', 'txt'];
    return [
      {
        id: 'extensions-menu',
        title: 'File Type',
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
      {
        title: 'sorted by',
        menuOptions: {displayInline: true},
        subactions: [
          {
            id: 'ascending',
            title: 'Ascending',
            image: Platform.select({
              ios: 'arrow.up.circle',
              android: 'outlined.ArrowUpward',
            }),
          },
          {
            id: 'descending',
            title: 'Descending',
            image: Platform.select({
              ios: 'arrow.down.circle',
              android: 'outlined.ArrowDownward',
            }),
          },
        ],
      },
    ];
  }, [normalizedExtension]);

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
