import {useCallback, useLayoutEffect, useMemo} from 'react';
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

  const rightActions = useMemo<HeaderAction[]>(() => {
    if (!isSelectionMode) {
      if (!filter) return [];

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

    const hasSelection = selectedCount > 0;
    const sharePress =
      isProcessing || !onShareSelected
        ? undefined
        : () => void onShareSelected();
    const deletePress =
      isProcessing || !onDeleteSelected
        ? undefined
        : () => void onDeleteSelected();

    const actions: HeaderAction[] = [];
    if (hasSelection && onShareSelected) {
      actions.push({
        type: 'custom',
        key: 'share',
        element: (
          <HeaderButton
            variant="share"
            accessibilityLabel={`Share selected ${labelPlural}`}
            accessibilityHint={`Share or download selected ${labelPlural}`}
            onPress={sharePress}
          />
        ),
      });
    }

    if (hasSelection && onDeleteSelected) {
      actions.push({
        type: 'custom',
        key: 'delete',
        element: (
          <HeaderButton
            variant="delete"
            accessibilityLabel={`Delete selected ${labelPlural}`}
            accessibilityHint={`Permanently delete selected ${labelPlural}`}
            onPress={deletePress}
          />
        ),
      });
    }

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

    return actions;
  }, [
    isSelectionMode,
    filter,
    showExtensionFilter,
    extension,
    odataOrderBy,
    onExtensionChange,
    onOrderByChange,
    onSelectPress,
    selectedCount,
    isProcessing,
    onShareSelected,
    onDeleteSelected,
    labelPlural,
    labelSingular,
    onCancelSelection,
  ]);

  const headerLeft = useCallback(() => {
    if (!isSelectionMode) return undefined;
    const hasAllSelected = totalCount > 0 && selectedCount === totalCount;

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
        onPress={hasAllSelected ? onDeselectAll : onSelectAll}
      />
    );
  }, [
    isSelectionMode,
    totalCount,
    selectedCount,
    labelPlural,
    labelSingular,
    onDeselectAll,
    onSelectAll,
  ]);

  useLayoutEffect(() => {
    const headerActionsOptions = getHeaderOptions({right: rightActions});
    navigation.setOptions({
      ...headerActionsOptions,
      headerLeft,
      headerTitle:
        isSelectionMode && selectedCount > 0
          ? `${selectedCount} selected`
          : title,
    });
  }, [
    navigation,
    rightActions,
    headerLeft,
    isSelectionMode,
    selectedCount,
    title,
  ]);
}
