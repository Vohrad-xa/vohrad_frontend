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

type OtherListProps = {
  onOtherPress: (otherId: string) => void;
  others: ItemAttachment[];
};

export function OtherList({onOtherPress, others}: OtherListProps) {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);
  const [loadingOtherId, setLoadingOtherId] = useState<string | null>(null);

  const handleOtherPress = useCallback(
    async (otherId: string) => {
      setLoadingOtherId(otherId);
      try {
        const results = await Promise.all([
          onOtherPress(otherId),
          new Promise((resolve) => setTimeout(resolve, 500)),
        ]);
        return results[0];
      } finally {
        setLoadingOtherId(null);
      }
    },
    [onOtherPress],
  );

  const transformOtherToListRow = useCallback(
    (other: ItemAttachment): ListRowData => ({
      id: other.id,
      name: other.original_filename,
      loading: loadingOtherId === other.id,
      onPress: () => handleOtherPress(other.id),
    }),
    [handleOtherPress, loadingOtherId],
  );

  const listData = others.map(transformOtherToListRow);

  const renderOtherIcon = useCallback(() => {
    if (Platform.OS === 'ios') {
      return (
        <SymbolView
          name="doc"
          type="hierarchical"
          size={30}
          tintColor={theme.secondary}
        />
      );
    } else {
      return (
        <Icon name={AppIcons.files.file} colorToken="secondary" size="xxl" />
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
          customLeftIcon={renderOtherIcon()}
        />
        {index < listData.length - 1 && (
          <View style={styles.dividerContainer}>
            <Divider />
          </View>
        )}
      </View>
    ),
    [listData.length, styles, renderOtherIcon],
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
