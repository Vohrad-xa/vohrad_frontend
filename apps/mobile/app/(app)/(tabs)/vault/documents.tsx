import React, {useCallback, useLayoutEffect, useRef, useState} from 'react';
import {Platform} from 'react-native';
import {useDeleteAttachment} from '@sykamore/store';
import {useNavigation} from 'expo-router';
import {Snackbar} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {HeaderButton} from '@/components/ui';
import {
  useAttachmentsByKind,
  useAttachmentPress,
  useAttachmentShare,
  DocumentsList,
  type DocumentsListRef,
} from '@/features/attachments';
import {useTheme} from '@/providers';
import {showConfirmAlert, sanitizeInlineText} from '@/utils';
import type {ItemAttachment} from '@sykamore/types';

/**
 * Coordinates the documents list with selection-driven header actions.
 *
 * - Mirrors selection state into native headers for share/delete flows
 * - Centralizes mutation side effects and snackbar feedback
 */
export default function VaultDocumentsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {ds} = useTheme();

  const {attachments: documentAttachments, getById: getDocumentById} =
    useAttachmentsByKind('document');

  const handleAttachmentPress = useAttachmentPress();
  const {shareAttachments, isProcessing} = useAttachmentShare();
  const {mutateAsync: deleteAttachment} = useDeleteAttachment();

  const documentsListRef = useRef<DocumentsListRef>(null);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [isInSelectionMode, setIsInSelectionMode] = useState(false);

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const showSnack = useCallback((msg: string) => {
    setSnackbarMessage(msg);
    setSnackbarVisible(true);
  }, []);

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
    documentsListRef.current?.clearSelection();
  }, []);

  const finishSelection = useCallback(
    (msg: string) => {
      handleCancelSelection();
      showSnack(msg);
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
            const document = getDocumentById(ids[0]);
            const fileName = sanitizeInlineText(
              document?.original_filename ?? document?.filename,
              'this document',
            );
            return `Are you sure you want to delete "${fileName}"?`;
          })()
        : `Are you sure you want to delete ${count} documents?`;

    showConfirmAlert({
      title: 'Delete Documents',
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
            count === 1 ? '1 document deleted' : `${count} documents deleted`,
          );
        } catch (error) {
          console.error('Failed to delete documents:', error);
        }
      },
    });
  }, [selectedIds, deleteAttachment, getDocumentById, finishSelection]);

  const handleShareSelected = useCallback(async () => {
    if (selectedIds.size === 0) return;

    const ids = Array.from(selectedIds);
    const count = ids.length;

    const selectedDocuments = ids
      .map((id) => getDocumentById(id))
      .filter((doc): doc is ItemAttachment => doc != null);

    try {
      const shared = await shareAttachments(selectedDocuments);

      if (!shared) {
        // For now we iOS selection if user cancels share sheet; Android needs cleanup!
        if (Platform.OS === 'android') {
          handleCancelSelection();
        }
        return;
      }

      finishSelection(
        count === 1 ? '1 document shared' : `${count} documents shared`,
      );
    } catch (error) {
      console.error('Share operation failed:', error);
    }
  }, [
    selectedIds,
    getDocumentById,
    shareAttachments,
    handleCancelSelection,
    finishSelection,
  ]);

  const handleSelectModePress = useCallback(() => {
    setIsInSelectionMode(true);
    documentsListRef.current?.enterSelectionMode();
  }, []);

  const handleSelectAll = useCallback(() => {
    documentsListRef.current?.selectAll();
  }, []);

  const handleDeselectAll = useCallback(() => {
    documentsListRef.current?.deselectAll();
  }, []);

  /**
   * Renders share/delete/cancel actions in the order the native header expects,
   */
  const headerRight = useCallback(() => {
    const cancelButton = (
      <HeaderButton
        variant="close"
        accessibilityLabel="Cancel selection"
        accessibilityHint="Exit selection mode"
        onPress={handleCancelSelection}
      />
    );

    if (isInSelectionMode) {
      if (selectedIds.size > 0) {
        const sharePress = isProcessing
          ? undefined
          : () => void handleShareSelected();
        const deletePress = isProcessing
          ? undefined
          : () => void handleDeleteSelected();

        return (
          <>
            <HeaderButton
              variant="share"
              accessibilityLabel="Share selected documents"
              accessibilityHint="Share or download selected documents"
              onPress={sharePress}
            />
            <HeaderButton
              variant="delete"
              accessibilityLabel="Delete selected documents"
              accessibilityHint="Permanently delete selected documents"
              onPress={deletePress}
            />
            {cancelButton}
          </>
        );
      }

      return cancelButton;
    }

    return (
      <HeaderButton
        variant={Platform.OS === 'ios' ? 'text' : 'edit'}
        text="Select"
        accessibilityLabel="Enter selection mode"
        accessibilityHint="Select documents to share or delete"
        onPress={handleSelectModePress}
      />
    );
  }, [
    handleCancelSelection,
    handleDeleteSelected,
    handleSelectModePress,
    handleShareSelected,
    isInSelectionMode,
    isProcessing,
    selectedIds.size,
  ]);

  /**
   * Surfaces the Select All / Deselect All affordance without adding extra UI,
   * mirroring whatever bulk action the user triggered last.
   */
  const headerLeft = useCallback(() => {
    if (!isInSelectionMode) return undefined;
    const totalDocs = documentAttachments.length;
    const hasAllSelected = totalDocs > 0 && selectedIds.size === totalDocs;
    return (
      <HeaderButton
        variant="text"
        text={hasAllSelected ? 'Deselect All' : 'Select All'}
        accessibilityLabel={
          hasAllSelected ? 'Deselect all documents' : 'Select all documents'
        }
        accessibilityHint={
          hasAllSelected
            ? 'Clear the current document selection'
            : 'Select all documents in the list'
        }
        onPress={hasAllSelected ? handleDeselectAll : handleSelectAll}
      />
    );
  }, [
    documentAttachments.length,
    handleDeselectAll,
    handleSelectAll,
    isInSelectionMode,
    selectedIds.size,
  ]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight,
      headerLeft,
    });
  }, [navigation, headerRight, headerLeft]);

  const handleDocumentPress = useCallback(
    async (documentId: string) => {
      const attachment = getDocumentById(documentId);
      if (!attachment) return;
      await handleAttachmentPress(attachment);
    },
    [getDocumentById, handleAttachmentPress],
  );

  return (
    <>
      <DocumentsList
        ref={documentsListRef}
        documents={documentAttachments}
        onDocumentPress={handleDocumentPress}
        onSelectionChange={handleSelectionChange}
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
