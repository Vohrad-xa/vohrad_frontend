import React, {useCallback, useState} from 'react';
import {Platform, StyleSheet, View} from 'react-native';
import {type ItemAttachment} from '@vohrad/types';
import {SymbolView} from 'expo-symbols';
import {
  ModalFlatList,
  ListRow,
  Divider,
  type ListRowData,
} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {Icon, AppIcons} from '@/utils/icons';
import {SFSymbols} from '@/utils/sf-symbols';
import {makeStyleFactory} from '@/utils/style-factory';

type DocumentsListProps = {
  onDocumentPress: (documentId: string) => void;
  documents: ItemAttachment[];
};

export function DocumentsList({
  onDocumentPress,
  documents,
}: DocumentsListProps) {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);
  const [loadingDocumentId, setLoadingDocumentId] = useState<string | null>(
    null,
  );

  const handleDocumentPress = useCallback(
    async (documentId: string) => {
      setLoadingDocumentId(documentId);
      try {
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

  const renderDocumentIcon = useCallback(() => {
    if (Platform.OS === 'ios') {
      return (
        <SymbolView
          name={SFSymbols.docTextFill}
          type="hierarchical"
          size={30}
          tintColor={theme.secondary}
        />
      );
    } else {
      return (
        <Icon
          name={AppIcons.content.document}
          colorToken="secondary"
          size="xxl"
        />
      );
    }
  }, [theme]);

  const renderItem = useCallback(
    ({item, index}: {item: ListRowData; index: number}) => (
      <View>
        <ListRow
          item={item}
          showImage={false}
          showChevron={false}
          customLeftIcon={renderDocumentIcon()}
        />
        {index < listData.length - 1 && (
          <View style={styles.dividerContainer}>
            <Divider />
          </View>
        )}
      </View>
    ),
    [listData.length, styles, renderDocumentIcon],
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
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
      },
      dividerContainer: {
        paddingLeft: ds.spacing.xxl + ds.spacing.md + 2,
        paddingRight: ds.spacing.xs,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
