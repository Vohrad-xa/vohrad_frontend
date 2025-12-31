import React, {useCallback, useLayoutEffect, useRef, useState} from 'react';
import {Platform} from 'react-native';
import {useDeleteAttachment} from '@sykamore/store';
import {useNavigation} from 'expo-router';
import {Snackbar} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  useAttachmentsByKind,
  useAttachmentPress,
  useAttachmentShare,
} from '@/features/attachments';
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
  const {shareAttachments, isProcessing} = useAttachmentShare();
  const {mutateAsync: deleteAttachment} = useDeleteAttachment();

  const documentsListRef = useRef<DocumentsListRef>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const isSelectionMode = selectedIds.size > 0;
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

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
          setSnackbarMessage(
            count === 1 ? '1 document deleted' : `${count} documents deleted`,
          );
          setSnackbarVisible(true);
        } catch (error) {
          console.error('Failed to delete documents:', error);
        }
      },
    });
  }, [selectedIds, deleteAttachment, getDocumentById]);

  const handleShareSelected = useCallback(async () => {
    if (selectedIds.size === 0 || isProcessing) return;

    const count = selectedIds.size;
    const selectedDocuments = Array.from(selectedIds)
      .map((id) => getDocumentById(id))
      .filter((doc) => doc != null);

    try {
      const shared = await shareAttachments(selectedDocuments);
      if (!shared) {
        if (Platform.OS === 'android') {
          documentsListRef.current?.clearSelection();
        }
        return;
      }

      documentsListRef.current?.clearSelection();
      setSnackbarMessage(
        count === 1 ? '1 document shared' : `${count} documents shared`,
      );
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Share operation failed:', error);
    }
  }, [selectedIds, getDocumentById, shareAttachments, isProcessing]);

  useLayoutEffect(() => {
    const right: HeaderAction[] | undefined = isSelectionMode
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
        ]
      : undefined;

    navigation.setOptions(
      getHeaderOptions({
        right,
      }),
    );
  }, [
    navigation,
    isSelectionMode,
    handleShareSelected,
    handleDeleteSelected,
    isProcessing,
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
        action={{label: 'OK'}}
      >
        {snackbarMessage}
      </Snackbar>
    </>
  );
}
