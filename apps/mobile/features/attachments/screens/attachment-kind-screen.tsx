import React, {useCallback, useState} from 'react';
import {useIsFocused} from '@react-navigation/native';
import {getAttachmentExtension} from '@sykamore/store';
import {useNavigation} from 'expo-router';
import {useSearch} from '@/features/dashboard';
import {
  useAttachmentsBulkActions,
  useAttachmentPress,
  useAttachmentsSelection,
  useAttachmentsHeader,
  useAttachmentsSnackbar,
  useAttachmentsSource,
} from '../hooks';
import {SelectableAttachmentsList} from '../views/attachments-list';
import type {AttachmentKind} from '@sykamore/types';

type AttachmentKindKey = Extract<
  AttachmentKind,
  'document' | 'archive' | 'other'
>;

type AttachmentKindScreenProps = {
  kind: AttachmentKindKey;
  title: string;
  labelSingular: string;
  labelPlural: string;
  deleteTitle?: string;
  showExtensionFilter?: boolean;
  listKey?: string;
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
  const handleAttachmentPress = useAttachmentPress();

  const [extension, setExtension] = useState<string | undefined>();
  const [odataOrderBy, setOdataOrderBy] = useState<string | undefined>();
  const {searchQuery} = useSearch();

  const {attachments, refresh, isLoading, lastUpdated, hasNext, loadMore} =
    useAttachmentsSource({
      kind,
      searchQuery,
      extension,
      odataOrderBy,
      enabled: isFocused,
    });

  const selection = useAttachmentsSelection(attachments);
  const {showSnack, snackbar} = useAttachmentsSnackbar();
  const {handleDeleteSelected, handleShareSelected, isProcessing} =
    useAttachmentsBulkActions({
      selection,
      labelSingular,
      labelPlural,
      deleteTitle,
      showSnack,
    });

  const normalizedExtension = getAttachmentExtension(
    extension ? {extension} : null,
  );
  const resolvedShowExtensionFilter =
    showExtensionFilter ?? kind === 'document';
  const headerTitle = normalizedExtension
    ? `${title} (.${normalizedExtension})`
    : title;

  const handleLoadMore = useCallback(() => {
    if (hasNext && !isLoading) {
      loadMore();
    }
  }, [hasNext, isLoading, loadMore]);

  const handleItemPress = useCallback(
    async (attachmentId: string) => {
      const attachment = attachments.find((item) => item.id === attachmentId);
      if (!attachment) return;
      await handleAttachmentPress(attachment);
    },
    [attachments, handleAttachmentPress],
  );

  useAttachmentsHeader({
    navigation,
    title: headerTitle,
    labelSingular,
    labelPlural,
    isSelectionMode: selection.isSelectionMode,
    selectedCount: selection.selectedCount,
    totalCount: attachments.length,
    onSelectAll: selection.selectAll,
    onDeselectAll: selection.deselectAll,
    onCancelSelection: selection.disableSelectionMode,
    onShareSelected: handleShareSelected,
    onDeleteSelected: handleDeleteSelected,
    isProcessing,
    filter: {
      showExtensionFilter: resolvedShowExtensionFilter,
      extension,
      odataOrderBy,
      onExtensionChange: setExtension,
      onOrderByChange: setOdataOrderBy,
      onSelectPress: selection.enableSelectionMode,
    },
  });

  return (
    <>
      <SelectableAttachmentsList
        listKey={listKey ?? kind}
        attachments={attachments}
        onAttachmentPress={handleItemPress}
        selection={selection}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        onRefresh={refresh}
        isLoading={isLoading}
        lastUpdated={lastUpdated}
      />

      {snackbar}
    </>
  );
}
