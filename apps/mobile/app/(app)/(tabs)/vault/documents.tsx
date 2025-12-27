import React, {useCallback, useLayoutEffect, useRef, useState} from 'react';
import {Platform} from 'react-native';
import {useDeleteAttachment} from '@sykamore/store';
import {useNavigation} from 'expo-router';
import {Snackbar} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useAttachmentsByKind, useAttachmentPress} from '@/features/attachments';
import {
  DocumentsList,
  type DocumentsListRef,
} from '@/features/attachments/screens/documents';
import {useTheme} from '@/providers';
import {
  showConfirmAlert,
  getHeaderOptions,
  type HeaderAction,
  sanitizeInlineText,
  AppIcons,
} from '@/utils';

export default function VaultDocumentsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {ds} = useTheme();

  const {attachments: documentAttachments, getById: getDocumentById} =
    useAttachmentsByKind('document');
  const handleAttachmentPress = useAttachmentPress();
  const {mutateAsync: deleteAttachment} = useDeleteAttachment();

  const documentsListRef = useRef<DocumentsListRef>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const isSelectionMode = selectedIds.size > 0;
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [deletedCount, setDeletedCount] = useState(0);

  const handleSelectionChange = useCallback((ids: Set<string>) => {
    setSelectedIds(ids);
  }, []);

  const handleDeleteSelected = useCallback(async () => {
    if (selectedIds.size === 0) return;

    let message: string;

    if (selectedIds.size === 1) {
      const documentId = Array.from(selectedIds)[0];
      const document = getDocumentById(documentId);

      const fileName = sanitizeInlineText(
        document?.original_filename ?? document?.filename,
        'this document',
      );

      message = `Are you sure you want to delete "${fileName}"?`;
    } else {
      message = `Are you sure you want to delete ${selectedIds.size} documents?`;
    }

    showConfirmAlert({
      title: 'Delete Documents',
      message,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      destructive: true,
      onConfirm: async () => {
        try {
          const count = selectedIds.size;
          await Promise.all(
            Array.from(selectedIds).map((id) =>
              deleteAttachment({attachmentId: id}),
            ),
          );
          documentsListRef.current?.clearSelection();
          setDeletedCount(count);
          setSnackbarVisible(true);
        } catch (error) {
          console.error('Failed to delete documents:', error);
        }
      },
    });
  }, [selectedIds, deleteAttachment, getDocumentById]);

  useLayoutEffect(() => {
    const right: HeaderAction[] | undefined = isSelectionMode
      ? [
          {
            type: 'button',
            key: 'delete',
            label: 'Delete',
            accessibilityLabel: 'Delete selected documents',
            accessibilityHint: 'Permanently delete selected documents',
            iosSymbol: AppIcons.actions.delete,
            icon: AppIcons.actions.delete,
            onPress: () => void handleDeleteSelected(),
          },
        ]
      : undefined;

    navigation.setOptions(
      getHeaderOptions({
        right,
      }),
    );
  }, [navigation, isSelectionMode, handleDeleteSelected]);

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
            : undefined
        }
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{borderRadius: ds.borderRadius.full}}
        action={{label: 'OK'}}
      >
        {deletedCount === 1
          ? '1 document deleted'
          : `${deletedCount} documents deleted`}
      </Snackbar>
    </>
  );
}
