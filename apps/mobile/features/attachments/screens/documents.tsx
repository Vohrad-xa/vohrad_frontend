import React, {useCallback, useMemo, memo, useState} from 'react';
import {
  Platform,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import {type ItemAttachment} from '@sykamore/types';
import {List, Divider} from 'react-native-paper';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {
  makeStyleFactory,
  Icon,
  formatDateShort,
  getAttachmentFileIcon,
  type AttachmentIcon,
} from '@/utils';

type DocumentsListProps = {
  onDocumentPress: (documentId: string) => void;
  documents: ItemAttachment[];
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
};

type DocumentRow = {
  id: string;
  uiTitle: string;
  uiDescription: string;
  fileIcon: AttachmentIcon;
};

type DocumentItemProps = {
  item: DocumentRow;
  styles: ReturnType<typeof createStyles>;
  isSelectionMode: boolean;
  isSelected: boolean;
  onPressRow: (id: string) => void;
  onLongPressRow: (id: string) => void;
};

type PaperSideProps = {
  color: string;
  style?: unknown;
};

const DocumentItem = memo<DocumentItemProps>(
  ({item, styles, isSelectionMode, isSelected, onPressRow, onLongPressRow}) => {
    const handlePress = useCallback(() => {
      onPressRow(item.id);
    }, [item.id, onPressRow]);

    const handleLongPress = useCallback(() => {
      onLongPressRow(item.id);
    }, [item.id, onLongPressRow]);

    const Left = useCallback(
      (props: PaperSideProps) => {
        if (isSelectionMode) {
          const icon = isSelected
            ? 'checkbox-marked'
            : 'checkbox-blank-outline';
          return (
            <List.Icon
              color={props.color}
              style={[
                props.style as StyleProp<ViewStyle>,
                styles.leftIconScale,
                styles.checkboxScale,
              ]}
              icon={icon}
            />
          );
        }

        return (
          <List.Icon
            color={props.color}
            style={[props.style as StyleProp<ViewStyle>, styles.leftIconScale]}
            icon={() => (
              <Icon
                name={item.fileIcon.name}
                size="lg"
                colorToken={item.fileIcon.colorToken}
                symbolType={item.fileIcon.symbolType}
                symbolColorTokens={item.fileIcon.symbolColorTokens}
              />
            )}
          />
        );
      },
      [
        isSelectionMode,
        isSelected,
        item.fileIcon,
        styles.leftIconScale,
        styles.checkboxScale,
      ],
    );

    return (
      <List.Item
        style={styles.content}
        title={item.uiTitle}
        description={item.uiDescription}
        left={Left}
        titleStyle={styles.title}
        descriptionStyle={styles.description}
        onPress={handlePress}
        onLongPress={handleLongPress}
      />
    );
  },
);

DocumentItem.displayName = 'DocumentItem';

export function DocumentsList({
  onDocumentPress,
  documents,
  onEndReached,
  onEndReachedThreshold,
}: DocumentsListProps) {
  const {ds, theme} = useTheme();
  const styles = useMemo(() => createStyles(ds, theme), [ds, theme]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const isSelectionMode = selectedIds.size > 0;

  const toggleSelected = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handlePressRow = useCallback(
    (id: string) => {
      if (isSelectionMode) {
        toggleSelected(id);
        return;
      }
      onDocumentPress(id);
    },
    [isSelectionMode, toggleSelected, onDocumentPress],
  );

  const handleLongPressRow = useCallback(
    (id: string) => {
      toggleSelected(id);
    },
    [toggleSelected],
  );

  const files = useMemo<DocumentRow[]>(() => {
    return documents.map((d) => {
      const size = Number(d.size);
      const fileSize = Number.isFinite(size)
        ? `${(size / 1024).toFixed(1)} KB`
        : 'Unknown size';

      const fileTypeRaw = (d.extension ?? d.file_type ?? 'Unknown').toString();
      const dateAdded = d.created_at ? formatDateShort(d.created_at) : '—';
      const title = d.original_filename ?? d.filename ?? 'Untitled';

      return {
        id: d.id,
        uiTitle: title,
        uiDescription: `${dateAdded} • ${fileTypeRaw.toUpperCase()} - ${fileSize}`,
        fileIcon: getAttachmentFileIcon({
          filename: title,
          extension: d.extension ?? null,
          fileType: d.file_type ?? null,
        }),
      };
    });
  }, [documents]);

  const renderItem = useCallback(
    ({item}: {item: DocumentRow}) => (
      <DocumentItem
        item={item}
        styles={styles}
        isSelectionMode={isSelectionMode}
        isSelected={selectedIds.has(item.id)}
        onPressRow={handlePressRow}
        onLongPressRow={handleLongPressRow}
      />
    ),
    [styles, isSelectionMode, selectedIds, handlePressRow, handleLongPressRow],
  );

  const keyExtractor = useCallback((item: DocumentRow) => item.id, []);

  const ItemSeparator = useCallback(
    () => <Divider style={styles.divider} />,
    [styles.divider],
  );

  const ListHeader = useCallback(
    () => <Divider style={styles.titleDivider} />,
    [styles.titleDivider],
  );

  return (
    <FlashList
      data={files}
      extraData={selectedIds}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={ItemSeparator}
      ListHeaderComponent={ListHeader}
    />
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      content: {
        paddingTop: ds.spacing.md,
        paddingBottom: ds.spacing.md,
        paddingRight: ds.spacing.lg,
      },

      title: {
        ...ds.typography.label,
        marginBottom: ds.spacing.xs,
      },

      description: {
        color: theme.muted,
        fontSize: ds.typography.caption.fontSize,
      },

      divider: {
        marginLeft: ds.spacing.xxl * 2 + ds.spacing.sm,
        marginRight: ds.spacing.lg,
      },

      titleDivider: {
        marginHorizontal: ds.spacing.lg,
        marginTop: ds.spacing.lg,
      },

      leftIconScale: {
        alignSelf: 'center',
        transform: Platform.OS === 'android' ? [{scale: 1.4}] : [{scale: 1.6}],
        width: ds.spacing.xxl + ds.spacing.sm,
      },
      checkboxScale: {
        transform: [{scale: 1}],
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
