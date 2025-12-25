import React, {
  useCallback,
  useMemo,
  memo,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {Platform, StyleSheet} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import {type ItemAttachment} from '@sykamore/types';
import {List, Divider} from 'react-native-paper';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {
  makeStyleFactory,
  Icon,
  formatDateShort,
  formatBytes,
  getAttachmentFileIcon,
  type AttachmentIcon,
} from '@/utils';

export type DocumentsListRef = {
  clearSelection: () => void;
};

type DocumentsListProps = {
  onDocumentPress: (documentId: string) => void;
  documents: ItemAttachment[];
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  onSelectionChange?: (selectedIds: Set<string>) => void;
};

type ListItemLeftProps = Parameters<
  NonNullable<React.ComponentProps<typeof List.Item>['left']>
>[0];

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

const DocumentItem = memo<DocumentItemProps>(
  ({item, styles, isSelectionMode, isSelected, onPressRow, onLongPressRow}) => {
    const handlePress = useCallback(() => {
      onPressRow(item.id);
    }, [item.id, onPressRow]);

    const handleLongPress = useCallback(() => {
      onLongPressRow(item.id);
    }, [item.id, onLongPressRow]);

    return (
      <List.Item
        style={styles.content}
        title={item.uiTitle}
        description={item.uiDescription}
        titleStyle={styles.title}
        descriptionStyle={styles.description}
        onPress={handlePress}
        onLongPress={handleLongPress}
        left={(props: ListItemLeftProps) => {
          if (isSelectionMode) {
            const icon = isSelected
              ? 'checkbox-marked'
              : 'checkbox-blank-outline';
            return (
              <List.Icon
                {...props}
                style={[
                  props.style,
                  styles.leftIconScale,
                  styles.checkboxScale,
                ]}
                icon={icon}
              />
            );
          }

          return (
            <List.Icon
              {...props}
              style={[props.style, styles.leftIconScale]}
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
        }}
      />
    );
  },
);

DocumentItem.displayName = 'DocumentItem';

export const DocumentsList = forwardRef<DocumentsListRef, DocumentsListProps>(
  (
    {
      onDocumentPress,
      documents,
      onEndReached,
      onEndReachedThreshold,
      onSelectionChange,
    },
    ref,
  ) => {
    const {ds, theme} = useTheme();
    const styles = createStyles(ds, theme);

    const [selectedIds, setSelectedIds] = useState<Set<string>>(
      () => new Set(),
    );
    const isSelectionMode = selectedIds.size > 0;

    const clearSelection = useCallback(() => {
      const empty = new Set<string>();
      setSelectedIds(empty);
      onSelectionChange?.(empty);
    }, [onSelectionChange]);

    useImperativeHandle(ref, () => ({clearSelection}), [clearSelection]);

    const toggleSelected = useCallback(
      (id: string) => {
        setSelectedIds((prev) => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          onSelectionChange?.(next);
          return next;
        });
      },
      [onSelectionChange],
    );

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
        const fileSize = formatBytes(Number(d.size));

        const fileTypeRaw = (
          d.extension ??
          d.file_type ??
          'Unknown'
        ).toString();
        const dateAdded = d.created_at ? formatDateShort(d.created_at) : '—';
        const title = d.original_filename ?? d.filename ?? 'Untitled';

        return {
          id: d.id,
          uiTitle: title,
          uiDescription: `${dateAdded} • ${fileTypeRaw.toUpperCase()} • ${fileSize}`,
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
      [
        styles,
        isSelectionMode,
        selectedIds,
        handlePressRow,
        handleLongPressRow,
      ],
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
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onEndReached={onEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={ItemSeparator}
        ListHeaderComponent={ListHeader}
      />
    );
  },
);

DocumentsList.displayName = 'DocumentsList';

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
