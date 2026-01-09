import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {Platform} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import {getAttachmentExtension, useDeleteAttachment} from '@sykamore/store';
import {type ItemAttachment} from '@sykamore/types';
import {useNavigation} from 'expo-router';
import {Snackbar} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {HeaderButton} from '@/components/ui';
import {useSearch} from '@/features/dashboard';
import {useTheme} from '@/providers';
import {AppIcons, sanitizeInlineText, showConfirmAlert} from '@/utils';
import {
  getHeaderOptions,
  type HeaderAction,
} from '@/utils/navigation/header-actions';
import {AttachmentsFilterMenu} from '../components';
import {
  useAttachmentSearch,
  useAttachmentsByKind,
  useAttachmentPress,
  useAttachmentShare,
} from '../hooks';
import {
  SelectableAttachmentsList,
  type SelectableAttachmentsListRef,
} from '../list/attachments-list';

type AttachmentKind = 'document' | 'archive' | 'other';

type AttachmentKindScreenProps = {
  kind: AttachmentKind;
  title: string;
  labelSingular: string;
  labelPlural: string;
  deleteTitle?: string;
  showExtensionFilter?: boolean;
  listKey?: string;
};

const capitalizeLabel = (value: string): string => {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
};

/**
 * Reusable attachment screen template that mirrors the Documents behavior.
 */
export function AttachmentKindScreen({
  kind,
  title,
  labelSingular,
  labelPlural,
  deleteTitle,
  showExtensionFilter,
  listKey,
}: AttachmentKindScreenProps) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {ds} = useTheme();
  const isFocused = useIsFocused();

  const [extension, setExtension] = useState<string | undefined>();
  const [odataOrderBy, setOdataOrderBy] = useState<string | undefined>();
  const {searchQuery} = useSearch();

  const {
    attachments: searchAttachments,
    refresh: searchRefresh,
    isLoading: searchIsLoading,
    lastUpdated: searchLastUpdated,
    hasNext: searchHasNext,
    loadMore: searchLoadMore,
    isSearchActive,
  } = useAttachmentSearch({
    searchQuery,
    kind,
    extension,
    odataOrderBy,
    enabled: isFocused,
  });

  const {attachments, refresh, isLoading, lastUpdated, hasNext, loadMore} =
    useAttachmentsByKind(kind, {
      extension,
      odataOrderBy,
      enabled: !isSearchActive,
    });

  const displayedAttachments = isSearchActive ? searchAttachments : attachments;
  const displayedRefresh = isSearchActive ? searchRefresh : refresh;
  const displayedIsLoading = isSearchActive ? searchIsLoading : isLoading;
  const displayedLastUpdated = isSearchActive ? searchLastUpdated : lastUpdated;
  const displayedHasNext = isSearchActive ? searchHasNext : hasNext;
  const displayedLoadMore = isSearchActive ? searchLoadMore : loadMore;

  const handleAttachmentPress = useAttachmentPress();
  const {shareAttachments, isProcessing} = useAttachmentShare();
  const {mutateAsync: deleteAttachment} = useDeleteAttachment();

  const listRef = useRef<SelectableAttachmentsListRef>(null);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [isInSelectionMode, setIsInSelectionMode] = useState(false);

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const normalizedExtension = getAttachmentExtension(
    extension ? {extension} : null,
  );
  const deleteTitleText = deleteTitle ?? capitalizeLabel(labelPlural);
  const resolvedShowExtensionFilter =
    showExtensionFilter ?? kind === 'document';

  const showSnack = useCallback((message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  }, []);

  const getAttachmentById = useCallback(
    (id: string) => displayedAttachments.find((item) => item.id === id),
    [displayedAttachments],
  );

  /**
   * Keeps selection mode latched once entered so the cancel button stays visible
   * even when the selection temporarily drops to zero.
   */
  const handleSelectionChange = useCallback((ids: Set<string>) => {
    setSelectedIds(new Set(ids));
    setIsInSelectionMode((prev) => prev || ids.size > 0);
  }, []);

  const handleCancelSelection = useCallback(() => {
    setIsInSelectionMode(false);
    listRef.current?.clearSelection();
  }, []);

  const finishSelection = useCallback(
    (message: string) => {
      handleCancelSelection();
      showSnack(message);
    },
    [handleCancelSelection, showSnack],
  );

  const handleDeleteSelected = useCallback(async () => {
    if (selectedIds.size === 0) return;

    const ids = Array.from(selectedIds);
    const count = ids.length;

    const message =
      count === 1
        ? (() => {
            const attachment = getAttachmentById(ids[0]);
            const fallbackLabel = `this ${labelSingular}`;
            const fileName = sanitizeInlineText(
              attachment?.original_filename ?? attachment?.filename,
              fallbackLabel,
            );
            return `Are you sure you want to delete "${fileName}"?`;
          })()
        : `Are you sure you want to delete ${count} ${labelPlural}?`;

    showConfirmAlert({
      title: `Delete ${deleteTitleText}`,
      message,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      destructive: true,
      onConfirm: async () => {
        try {
          await Promise.all(
            ids.map((attachmentId) => deleteAttachment({attachmentId})),
          );

          finishSelection(
            count === 1
              ? `1 ${labelSingular} deleted`
              : `${count} ${labelPlural} deleted`,
          );
        } catch (error) {
          console.error('Failed to delete attachments:', error);
        }
      },
    });
  }, [
    selectedIds,
    deleteAttachment,
    getAttachmentById,
    finishSelection,
    labelSingular,
    labelPlural,
    deleteTitleText,
  ]);

  const handleShareSelected = useCallback(async () => {
    if (selectedIds.size === 0) return;

    const ids = Array.from(selectedIds);
    const count = ids.length;

    const selectedAttachments = ids
      .map((id) => getAttachmentById(id))
      .filter((item): item is ItemAttachment => item != null);

    try {
      const shared = await shareAttachments(selectedAttachments);

      if (!shared) {
        // For now we iOS selection if user cancels share sheet; Android needs cleanup!
        if (Platform.OS === 'android') {
          handleCancelSelection();
        }
        return;
      }

      finishSelection(
        count === 1
          ? `1 ${labelSingular} shared`
          : `${count} ${labelPlural} shared`,
      );
    } catch (error) {
      console.error('Share operation failed:', error);
    }
  }, [
    selectedIds,
    getAttachmentById,
    shareAttachments,
    handleCancelSelection,
    finishSelection,
    labelSingular,
    labelPlural,
  ]);

  const handleSelectModePress = useCallback(() => {
    setIsInSelectionMode(true);
    listRef.current?.enterSelectionMode();
  }, []);

  const handleSelectAll = useCallback(() => {
    listRef.current?.selectAll();
  }, []);

  const handleDeselectAll = useCallback(() => {
    listRef.current?.deselectAll();
  }, []);

  const handleLoadMore = useCallback(() => {
    if (displayedHasNext && !displayedIsLoading) {
      displayedLoadMore();
    }
  }, [displayedHasNext, displayedIsLoading, displayedLoadMore]);

  const rightActions = useMemo<HeaderAction[]>(() => {
    if (!isInSelectionMode) {
      return [
        {
          type: 'custom',
          key: 'filter',
          element: (
            <AttachmentsFilterMenu
              showExtensionFilter={resolvedShowExtensionFilter}
              extension={extension}
              odataOrderBy={odataOrderBy}
              onExtensionChange={setExtension}
              onOrderByChange={setOdataOrderBy}
              onSelectPress={handleSelectModePress}
            />
          ),
        },
      ];
    }

    const hasSelection = selectedIds.size > 0;
    const sharePress = isProcessing
      ? undefined
      : () => void handleShareSelected();
    const deletePress = isProcessing
      ? undefined
      : () => void handleDeleteSelected();

    const actions: HeaderAction[] = [];
    if (hasSelection) {
      actions.push(
        {
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
        },
        {
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
        },
      );
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
      onPress: handleCancelSelection,
    });

    return actions;
  }, [
    handleCancelSelection,
    handleDeleteSelected,
    handleSelectModePress,
    handleShareSelected,
    isInSelectionMode,
    isProcessing,
    selectedIds.size,
    extension,
    odataOrderBy,
    resolvedShowExtensionFilter,
    labelPlural,
    labelSingular,
  ]);

  /**
   * Surfaces the Select All / Deselect All affordance without adding extra UI,
   * mirroring whatever bulk action the user triggered last.
   */
  const headerLeft = useCallback(() => {
    if (!isInSelectionMode) return undefined;
    const totalItems = displayedAttachments.length;
    const hasAllSelected = totalItems > 0 && selectedIds.size === totalItems;
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
        onPress={hasAllSelected ? handleDeselectAll : handleSelectAll}
      />
    );
  }, [
    displayedAttachments.length,
    handleDeselectAll,
    handleSelectAll,
    isInSelectionMode,
    selectedIds.size,
    labelPlural,
    labelSingular,
  ]);

  useLayoutEffect(() => {
    const headerActionsOptions = getHeaderOptions({right: rightActions});
    navigation.setOptions({
      ...headerActionsOptions,
      headerLeft,
      headerTitle:
        isInSelectionMode && selectedIds.size > 0
          ? `${selectedIds.size} selected`
          : normalizedExtension
            ? `${title} (.${normalizedExtension})`
            : title,
      headerTitleAlign: isInSelectionMode ? 'center' : 'left',
    });
  }, [
    navigation,
    rightActions,
    headerLeft,
    isInSelectionMode,
    selectedIds.size,
    normalizedExtension,
    title,
  ]);

  const handleItemPress = useCallback(
    async (attachmentId: string) => {
      const attachment = getAttachmentById(attachmentId);
      if (!attachment) return;
      await handleAttachmentPress(attachment);
    },
    [getAttachmentById, handleAttachmentPress],
  );

  return (
    <>
      <SelectableAttachmentsList
        ref={listRef}
        listKey={listKey ?? kind}
        attachments={displayedAttachments}
        onAttachmentPress={handleItemPress}
        onSelectionChange={handleSelectionChange}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        onRefresh={displayedRefresh}
        isLoading={displayedIsLoading}
        lastUpdated={displayedLastUpdated}
      />

      <Snackbar
        visible={snackbarVisible}
        wrapperStyle={
          Platform.OS === 'ios'
            ? {bottom: insets.bottom + ds.spacing.md}
            : {bottom: insets.bottom + ds.layout.tabBarHeight}
        }
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{borderRadius: ds.borderRadius.full}}
        action={{label: 'OK', onPress: () => setSnackbarVisible(false)}}
      >
        {snackbarMessage}
      </Snackbar>
    </>
  );
}
