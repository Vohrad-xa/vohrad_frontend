import React, {useCallback, useRef, useState} from 'react';
import {Platform} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import {getAttachmentExtension, useDeleteAttachment} from '@sykamore/store';
import {type ItemAttachment} from '@sykamore/types';
import {useNavigation} from 'expo-router';
import {useSearch} from '@/features/dashboard';
import {sanitizeInlineText, showConfirmAlert} from '@/utils';
import {
  useAttachmentsHeader,
  useAttachmentsSnackbar,
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

  const {showSnack, snackbar} = useAttachmentsSnackbar();

  const normalizedExtension = getAttachmentExtension(
    extension ? {extension} : null,
  );
  const deleteTitleText = deleteTitle ?? capitalizeLabel(labelPlural);
  const resolvedShowExtensionFilter =
    showExtensionFilter ?? kind === 'document';
  const headerTitle = normalizedExtension
    ? `${title} (.${normalizedExtension})`
    : title;

  const getAttachmentById = useCallback(
    (id: string) => displayedAttachments.find((item) => item.id === id),
    [displayedAttachments],
  );

  /**
   * Keeps selection mode latched once entered so the cancel button stays visible
   * even when the selection temporarily drops to zero.
   */
  const handleSelectionChange = useCallback((ids: ReadonlySet<string>) => {
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

  useAttachmentsHeader({
    navigation,
    title: headerTitle,
    labelSingular,
    labelPlural,
    isSelectionMode: isInSelectionMode,
    selectedCount: selectedIds.size,
    totalCount: displayedAttachments.length,
    onSelectAll: handleSelectAll,
    onDeselectAll: handleDeselectAll,
    onCancelSelection: handleCancelSelection,
    onShareSelected: handleShareSelected,
    onDeleteSelected: handleDeleteSelected,
    isProcessing,
    filter: {
      showExtensionFilter: resolvedShowExtensionFilter,
      extension,
      odataOrderBy,
      onExtensionChange: setExtension,
      onOrderByChange: setOdataOrderBy,
      onSelectPress: handleSelectModePress,
    },
  });

  const handleLoadMore = useCallback(() => {
    if (displayedHasNext && !displayedIsLoading) {
      displayedLoadMore();
    }
  }, [displayedHasNext, displayedIsLoading, displayedLoadMore]);

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

      {snackbar}
    </>
  );
}
