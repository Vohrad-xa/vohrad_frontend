import {useCallback, useLayoutEffect, useMemo} from 'react';
import {Platform} from 'react-native';
import {HeaderButton} from '@/components/ui';
import {AppIcons} from '@/utils';
import {
  getHeaderOptions,
  type HeaderAction,
  type NavigationLike,
} from '@/utils/navigation/header-actions';
import {AttachmentsFilterMenu} from '../components/attachments-filter-menu';

type AttachmentsHeaderFilterConfig = {
  showExtensionFilter?: boolean;
  extension?: string;
  odataOrderBy?: string;
  onExtensionChange?: (extension: string | undefined) => void;
  onOrderByChange?: (orderBy: string | undefined) => void;
  onSelectPress?: () => void;
};

type UseAttachmentsHeaderOptions = {
  navigation: NavigationLike;
  title: string;
  isSelectionMode: boolean;
  selectedCount: number;
  totalCount: number;
  labelSingular: string;
  labelPlural: string;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onCancelSelection: () => void;
  onShareSelected?: () => void;
  onDeleteSelected?: () => void;
  isProcessing?: boolean;
  filter?: AttachmentsHeaderFilterConfig;
};

/**
 * Apply the standard attachments header actions (filter + selection).
 *
 * - Pass a resolved title string (including any filter state).
 */
export function useAttachmentsHeader({
  navigation,
  title,
  isSelectionMode,
  selectedCount,
  totalCount,
  labelSingular,
  labelPlural,
  onSelectAll,
  onDeselectAll,
  onCancelSelection,
  onShareSelected,
  onDeleteSelected,
  isProcessing = false,
  filter,
}: UseAttachmentsHeaderOptions) {
  const {
    showExtensionFilter,
    extension,
    odataOrderBy,
    onExtensionChange,
    onOrderByChange,
    onSelectPress,
  } = filter ?? {};

  const hasFilter = filter != null;

  const hasSelection = selectedCount > 0;

  const hasAllSelected = totalCount > 0 && selectedCount === totalCount;

  const handleSelectAllPress = useCallback(() => {
    if (hasAllSelected) {
      onDeselectAll();
      return;
    }
    onSelectAll();
  }, [hasAllSelected, onDeselectAll, onSelectAll]);

  const sharePress = useCallback(
    () => void onShareSelected?.(),
    [onShareSelected],
  );

  const deletePress = useCallback(
    () => void onDeleteSelected?.(),
    [onDeleteSelected],
  );

  const selectAllButton = useMemo(() => {
    return (
      <HeaderButton
        variant="text"
        text={hasAllSelected ? 'Deselect All' : 'Select All'}
        accessibilityLabel={
          hasAllSelected
            ? `Deselect all ${labelPlural}`
            : `Select all ${labelPlural}`
        }
        accessibilityHint={
          hasAllSelected
            ? `Clear the current ${labelSingular} selection`
            : `Select all ${labelPlural} in the list`
        }
        onPress={handleSelectAllPress}
      />
    );
  }, [hasAllSelected, labelPlural, labelSingular, handleSelectAllPress]);

  const rightActions = useMemo<HeaderAction[]>(() => {
    if (!isSelectionMode) {
      if (!hasFilter) return [];

      return [
        {
          type: 'custom',
          key: 'filter',
          element: (
            <AttachmentsFilterMenu
              showExtensionFilter={showExtensionFilter}
              extension={extension}
              odataOrderBy={odataOrderBy}
              onExtensionChange={onExtensionChange}
              onOrderByChange={onOrderByChange}
              onSelectPress={onSelectPress}
            />
          ),
        },
      ];
    }

    const actions: HeaderAction[] = [];

    if (Platform.OS === 'android') {
      actions.push({
        type: 'custom',
        key: 'select-all',
        element: selectAllButton,
      });
    }

    if (onShareSelected) {
      const shareDisabled = !hasSelection || isProcessing;
      actions.push({
        type: 'custom',
        key: 'share',
        element: (
          <HeaderButton
            variant="share"
            accessibilityLabel={`Share selected ${labelPlural}`}
            accessibilityHint={`Share or download selected ${labelPlural}`}
            disabled={shareDisabled}
            onPress={shareDisabled ? undefined : sharePress}
          />
        ),
      });
    }

    if (onDeleteSelected) {
      const deleteDisabled = !hasSelection || isProcessing;
      actions.push({
        type: 'custom',
        key: 'delete',
        element: (
          <HeaderButton
            variant="delete"
            accessibilityLabel={`Delete selected ${labelPlural}`}
            accessibilityHint={`Permanently delete selected ${labelPlural}`}
            disabled={deleteDisabled}
            onPress={deleteDisabled ? undefined : deletePress}
          />
        ),
      });
    }

    if (Platform.OS !== 'android') {
      actions.push({
        type: 'button',
        key: 'cancel',
        label: 'Cancel',
        variant: 'done',
        icon: AppIcons.actions.close,
        iosSymbol: 'checkmark',
        accessibilityLabel: 'Cancel selection',
        accessibilityHint: `Exit ${labelSingular} selection mode`,
        sharesBackground: false,
        onPress: onCancelSelection,
      });
    }

    return actions;
  }, [
    isSelectionMode,
    hasFilter,
    showExtensionFilter,
    extension,
    odataOrderBy,
    onExtensionChange,
    onOrderByChange,
    onSelectPress,
    hasSelection,
    isProcessing,
    onShareSelected,
    onDeleteSelected,
    sharePress,
    deletePress,
    labelPlural,
    labelSingular,
    onCancelSelection,
    selectAllButton,
  ]);

  const headerLeft = useCallback(() => {
    if (!isSelectionMode) return undefined;

    if (Platform.OS === 'android') {
      return (
        <HeaderButton
          variant="close"
          accessibilityLabel="Cancel selection"
          accessibilityHint={`Exit ${labelSingular} selection mode`}
          onPress={onCancelSelection}
        />
      );
    }

    return selectAllButton;
  }, [isSelectionMode, onCancelSelection, labelSingular, selectAllButton]);

  const headerActionsOptions = useMemo(
    () => getHeaderOptions({right: rightActions}),
    [rightActions],
  );

  const headerTitle = useMemo(
    () =>
      isSelectionMode && hasSelection ? `${selectedCount} selected` : title,
    [isSelectionMode, hasSelection, selectedCount, title],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      ...headerActionsOptions,
      ...(isSelectionMode ? {headerLeft} : {}),
    });
  }, [navigation, headerActionsOptions, headerLeft, isSelectionMode]);

  useLayoutEffect(() => {
    navigation.setOptions({headerTitle});
  }, [navigation, headerTitle]);
}
