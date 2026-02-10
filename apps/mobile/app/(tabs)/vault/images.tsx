import {useCallback, useState} from 'react';
import {useIsFocused} from '@react-navigation/native';
import {useNavigation} from 'expo-router';
import {
  ImageAttachmentsGrid,
  useAttachmentsBulkActions,
  useAttachmentPress,
  useAttachmentsSelection,
  useAttachmentsHeader,
  useAttachmentsSnackbar,
  useAttachmentsSource,
  useImageAttachments,
  type ImageAttachmentItem,
} from '@/features/attachments';
import {VAULT_SEARCH_SCOPES} from '@/features/attachments/utils';
import {useSearch} from '@/providers';

export default function VaultImagesScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const handleAttachmentPress = useAttachmentPress();
  const {searchQuery} = useSearch(VAULT_SEARCH_SCOPES.images);
  const [odataOrderBy, setOdataOrderBy] = useState<string | undefined>();
  const {showSnack, snackbar} = useAttachmentsSnackbar();

  const {
    attachments,
    loadMore,
    hasNext,
    isLoading,
    isFetchingNextPage,
    refresh,
  } = useAttachmentsSource({
    kind: 'image',
    searchQuery,
    odataOrderBy,
    enabled: isFocused,
  });

  const imageAttachments = useImageAttachments(attachments);
  const selection = useAttachmentsSelection(imageAttachments);
  const {handleDeleteSelected, handleShareSelected, isProcessing} =
    useAttachmentsBulkActions({
      selection,
      labelSingular: 'image',
      labelPlural: 'images',
      showSnack,
    });

  const handleImagePress = useCallback(
    async (attachment: ImageAttachmentItem) => {
      await handleAttachmentPress(attachment);
    },
    [handleAttachmentPress],
  );

  useAttachmentsHeader({
    navigation,
    title: 'Library',
    labelSingular: 'image',
    labelPlural: 'images',
    isSelectionMode: selection.isSelectionMode,
    selectedCount: selection.selectedCount,
    totalCount: imageAttachments.length,
    onSelectAll: selection.selectAll,
    onDeselectAll: selection.deselectAll,
    onCancelSelection: selection.disableSelectionMode,
    onShareSelected: handleShareSelected,
    onDeleteSelected: handleDeleteSelected,
    isProcessing,
    filter: {
      showExtensionFilter: false,
      odataOrderBy,
      onOrderByChange: setOdataOrderBy,
      onSelectPress: selection.enableSelectionMode,
    },
  });

  return (
    <>
      <ImageAttachmentsGrid
        attachments={imageAttachments}
        loadMore={loadMore}
        hasNext={hasNext}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        refresh={refresh}
        onImagePress={handleImagePress}
        selection={selection}
      />
      {snackbar}
    </>
  );
}
