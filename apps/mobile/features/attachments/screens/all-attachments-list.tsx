import React, {useCallback, useState} from 'react';
import {Platform, StyleSheet, View} from 'react-native';
import {SymbolView} from 'expo-symbols';
import {
  ModalFlatList,
  ListRow,
  Divider,
  type ListRowData,
} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {Icon, AppIcons} from '@/utils';
import {makeStyleFactory} from '@/utils/style-factory';
import type {ItemAttachment, AttachmentKind} from '@sykamore/types';

type AllAttachmentsListProps = {
  onAttachmentPress: (attachmentId: string) => void;
  attachments: ItemAttachment[];
};

export function AllAttachmentsList({
  onAttachmentPress,
  attachments,
}: AllAttachmentsListProps) {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);
  const [loadingAttachmentId, setLoadingAttachmentId] = useState<string | null>(
    null,
  );

  const handleAttachmentPress = useCallback(
    async (attachmentId: string) => {
      setLoadingAttachmentId(attachmentId);
      try {
        const results = await Promise.all([
          onAttachmentPress(attachmentId),
          new Promise((resolve) => setTimeout(resolve, 500)),
        ]);
        return results[0];
      } finally {
        setLoadingAttachmentId(null);
      }
    },
    [onAttachmentPress],
  );

  const transformAttachmentToListRow = useCallback(
    (attachment: ItemAttachment): ListRowData => ({
      id: attachment.id,
      name: attachment.original_filename,
      loading: loadingAttachmentId === attachment.id,
      onPress: () => handleAttachmentPress(attachment.id),
    }),
    [handleAttachmentPress, loadingAttachmentId],
  );

  const listData = attachments.map(transformAttachmentToListRow);

  const renderAttachmentIcon = useCallback(
    (attachment: ItemAttachment) => {
      const kind = attachment.kind as AttachmentKind;

      if (Platform.OS === 'ios') {
        let symbolName: string;
        switch (kind) {
          case 'image':
            symbolName = AppIcons.files.image;
            break;
          case 'document':
            symbolName = AppIcons.files.document;
            break;
          case 'video':
            symbolName = AppIcons.files.image;
            break;
          case 'archive':
            symbolName = AppIcons.files.archive;
            break;
          default:
            symbolName = AppIcons.files.file;
        }

        return (
          <SymbolView
            name={symbolName}
            type="hierarchical"
            size={30}
            tintColor={theme.secondary}
          />
        );
      } else {
        let iconName: string;
        switch (kind) {
          case 'image':
            iconName = AppIcons.files.image;
            break;
          case 'document':
            iconName = AppIcons.files.document;
            break;
          case 'video':
            iconName = AppIcons.files.file;
            break;
          case 'archive':
            iconName = AppIcons.files.archive;
            break;
          default:
            iconName = AppIcons.files.file;
        }

        return <Icon name={iconName} colorToken="secondary" size="xxl" />;
      }
    },
    [theme],
  );

  const renderItem = useCallback(
    ({item, index}: {item: ListRowData & {id: string}; index: number}) => {
      const attachment = attachments.find((a) => a.id === item.id);
      if (!attachment) return null;

      return (
        <View>
          <ListRow
            item={item}
            showImage={false}
            showChevron={false}
            customLeftIcon={renderAttachmentIcon(attachment)}
          />
          {index < listData.length - 1 && (
            <View style={styles.dividerContainer}>
              <Divider />
            </View>
          )}
        </View>
      );
    },
    [listData.length, styles, renderAttachmentIcon, attachments],
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
