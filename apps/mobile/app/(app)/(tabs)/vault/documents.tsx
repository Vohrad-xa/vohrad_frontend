import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {Platform} from 'react-native';
import {useDeleteAttachment} from '@sykamore/store';
import {useNavigation} from 'expo-router';
import {Snackbar} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  useAttachmentsByKind,
  useAttachmentPress,
  useAttachmentShare,
  DocumentsList,
  type DocumentsListRef,
} from '@/features/attachments';
import {useTheme} from '@/providers';
import {
  showConfirmAlert,
  getHeaderOptions,
  type HeaderAction,
  sanitizeInlineText,
  AppIcons,
} from '@/utils';
import type {ItemAttachment} from '@sykamore/types';

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
  const isSelectionMode = selectedIds.size > 0;

  const [isInSelectionMode, setIsInSelectionMode] = useState(false);

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const showSnack = useCallback((msg: string) => {
    setSnackbarMessage(msg);
    setSnackbarVisible(true);
  }, []);

  const handleSelectionChange = useCallback((ids: Set<string>) => {
    setSelectedIds(new Set(ids));
    if (ids.size > 0) setIsInSelectionMode(true);
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
    if (selectedIds.size === 0 || isProcessing) return;

    const ids = Array.from(selectedIds);
    const count = ids.length;

    const selectedDocuments = ids
      .map((id) => getDocumentById(id))
      .filter((doc): doc is ItemAttachment => doc != null);

    try {
      const shared = await shareAttachments(selectedDocuments);

      if (!shared) {
        // Keep iOS selection if user cancels share sheet; Android needs clean!
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
    isProcessing,
    handleCancelSelection,
    finishSelection,
  ]);

  const handleSelectModePress = useCallback(() => {
    setIsInSelectionMode(true);
    documentsListRef.current?.enterSelectionMode();
  }, []);

  const cancelAction: HeaderAction = useMemo(
    () => ({
      type: 'button',
      key: 'cancel',
      label: 'Cancel',
      accessibilityLabel: 'Cancel selection',
      accessibilityHint: 'Exit selection mode',
      iosSymbol: 'xmark',
      icon: AppIcons.actions.close,
      onPress: handleCancelSelection,
    }),
    [handleCancelSelection],
  );

  useLayoutEffect(() => {
    const right: HeaderAction[] | undefined = isInSelectionMode
      ? isSelectionMode
        ? [
            {
              type: 'button',
              key: 'share',
              label: 'Share',
              accessibilityLabel: 'Share selected documents',
              accessibilityHint: 'Share or download selected documents',
              iosSymbol: 'square.and.arrow.up',
              icon: AppIcons.actions.share,
              onPress: () => void handleShareSelected(),
              disabled: isProcessing,
            },
            {
              type: 'button',
              key: 'delete',
              label: 'Delete',
              accessibilityLabel: 'Delete selected documents',
              accessibilityHint: 'Permanently delete selected documents',
              iosSymbol: 'trash',
              icon: AppIcons.actions.delete,
              onPress: () => void handleDeleteSelected(),
              disabled: isProcessing,
            },
            cancelAction,
          ]
        : [cancelAction]
      : [
          {
            type: 'button',
            key: 'select',
            label: 'Select',
            accessibilityLabel: 'Enter selection mode',
            accessibilityHint: 'Select documents to share or delete',
            icon: AppIcons.actions.edit,
            onPress: handleSelectModePress,
          },
        ];

    navigation.setOptions(
      getHeaderOptions({
        right,
      }),
    );
  }, [
    navigation,
    isInSelectionMode,
    isSelectionMode,
    handleShareSelected,
    handleDeleteSelected,
    isProcessing,
    handleSelectModePress,
    cancelAction,
  ]);

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
