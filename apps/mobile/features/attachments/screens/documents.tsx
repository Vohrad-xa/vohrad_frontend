import React, {useCallback, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {type ItemAttachment} from '@vohrad/types';
import {
  ModalFlatList,
  ListRow,
  Divider,
  type ListRowData,
} from '@/components/ui';
import {type DSShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';

type DocumentsListProps = {
  onDocumentPress: (documentId: string) => void;
  documents: ItemAttachment[];
};

export function DocumentsList({
  onDocumentPress,
  documents,
}: DocumentsListProps) {
  const {ds} = useTheme();
  const styles = createStyles(ds);
  const [loadingDocumentId, setLoadingDocumentId] = useState<string | null>(
    null,
  );

  const handleDocumentPress = useCallback(
    async (documentId: string) => {
      setLoadingDocumentId(documentId);
      try {
        // Show loading for at least 500ms to ensure visibility
        const results = await Promise.all([
          onDocumentPress(documentId),
          new Promise((resolve) => setTimeout(resolve, 500)),
        ]);
        return results[0];
      } finally {
        setLoadingDocumentId(null);
      }
    },
    [onDocumentPress],
  );

  const transformDocumentToListRow = useCallback(
    (document: ItemAttachment): ListRowData => ({
      id: document.id,
      name: document.original_filename,
      loading: loadingDocumentId === document.id,
      onPress: () => handleDocumentPress(document.id),
    }),
    [handleDocumentPress, loadingDocumentId],
  );

  const listData = documents.map(transformDocumentToListRow);

  const renderItem = useCallback(
    ({item, index}: {item: ListRowData; index: number}) => (
      <View>
        <ListRow item={item} showImage showChevron={false} />
        {index < listData.length - 1 && (
          <View style={styles.dividerContainer}>
            <Divider />
          </View>
        )}
      </View>
    ),
    [listData.length, styles],
  );

  return (
    <View style={styles.container}>
      <ModalFlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
      },
      dividerContainer: {
        paddingLeft: ds.spacing.xl + ds.spacing.xl + 8,
        paddingRight: ds.spacing.xs,
      },
    }),
  (ds) => `${ds.version}`,
);
