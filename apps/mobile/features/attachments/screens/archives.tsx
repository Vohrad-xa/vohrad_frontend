import React, {useCallback, useState} from 'react';
import {Platform, StyleSheet, View} from 'react-native';
import {type ItemAttachment} from '@sykamore/types';
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
import {makeStyleFactory} from '@/utils/style-factory';

type ArchivesListProps = {
  onArchivePress: (archiveId: string) => void;
  archives: ItemAttachment[];
};

export function ArchivesList({onArchivePress, archives}: ArchivesListProps) {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);
  const [loadingArchiveId, setLoadingArchiveId] = useState<string | null>(null);

  const handleArchivePress = useCallback(
    async (archiveId: string) => {
      setLoadingArchiveId(archiveId);
      try {
        const results = await Promise.all([
          onArchivePress(archiveId),
          new Promise((resolve) => setTimeout(resolve, 500)),
        ]);
        return results[0];
      } finally {
        setLoadingArchiveId(null);
      }
    },
    [onArchivePress],
  );

  const transformArchiveToListRow = useCallback(
    (archive: ItemAttachment): ListRowData => ({
      id: archive.id,
      name: archive.original_filename,
      loading: loadingArchiveId === archive.id,
      onPress: () => handleArchivePress(archive.id),
    }),
    [handleArchivePress, loadingArchiveId],
  );

  const listData = archives.map(transformArchiveToListRow);

  const renderArchiveIcon = useCallback(() => {
    if (Platform.OS === 'ios') {
      return (
        <SymbolView
          name="archivebox"
          type="hierarchical"
          size={30}
          tintColor={theme.secondary}
        />
      );
    } else {
      return (
        <Icon name={AppIcons.files.archive} colorToken="secondary" size="xxl" />
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
          customLeftIcon={renderArchiveIcon()}
        />
        {index < listData.length - 1 && (
          <View style={styles.dividerContainer}>
            <Divider />
          </View>
        )}
      </View>
    ),
    [listData.length, styles, renderArchiveIcon],
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
