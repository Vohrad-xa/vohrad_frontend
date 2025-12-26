import React, {useCallback, useLayoutEffect, useRef, useState} from 'react';
import {Platform} from 'react-native';
import {useDeleteAttachment} from '@sykamore/store';
import {useNavigation} from 'expo-router';
import {IconButton, Snackbar} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  useAttachmentsByKind,
  useAttachmentPress,
  VaultOptionsMenu,
} from '@/features/attachments';
import {
  DocumentsList,
  type DocumentsListRef,
} from '@/features/attachments/screens/documents';
import {useTheme} from '@/providers';
import {showConfirmAlert, sanitizeInlineText} from '@/utils';

export default function VaultDocumentsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {ds, theme} = useTheme();

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
    const options =
      Platform.OS === 'ios'
        ? {
            unstable_headerRightItems: () =>
              isSelectionMode
                ? [
                    {
                      type: 'button',
                      label: 'Delete',
                      icon: {type: 'sfSymbol', name: 'trash'},
                      onPress: () => void handleDeleteSelected(),
                    },
                  ]
                : [{type: 'custom', element: <VaultOptionsMenu />}],
          }
        : {
            headerRight: () =>
              isSelectionMode ? (
                <>
                  <IconButton
                    icon="delete"
                    onPress={() => void handleDeleteSelected()}
                    style={{margin: 0}}
                  />
                </>
              ) : (
                <VaultOptionsMenu />
              ),
          };

    navigation.setOptions(options);
  }, [
    navigation,
    isSelectionMode,
    handleDeleteSelected,
    theme.destructive,
    theme.accentBlue,
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
        wrapperStyle={{bottom: insets.bottom + ds.spacing.lg}}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{borderRadius: ds.borderRadius.full}}
        action={{
          label: 'OK',
        }}
      >
        {deletedCount === 1
          ? '1 document deleted'
          : `${deletedCount} documents deleted`}
      </Snackbar>
    </>
  );
}
