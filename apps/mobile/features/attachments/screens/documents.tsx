import React, {
  useCallback,
  useMemo,
  memo,
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
} from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import {type ItemAttachment} from '@sykamore/types';
import {Checkbox, Divider} from 'react-native-paper';
import {ThemedText} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme, useHaptic} from '@/providers';
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

type DocumentRow = {
  id: string;
  uiTitle: string;
  uiDescription: string;
  fileIcon: AttachmentIcon;
};

type DocumentItemProps = {
  item: DocumentRow;
  styles: ReturnType<typeof createStyles>;
  selectionVisible: boolean;
  isSelected: boolean;
  onPressRow: (id: string) => void;
  onLongPressRow: (id: string) => void;
  animation: Animated.Value;
  selectionShift: number;
};

const DocumentItem = memo<DocumentItemProps>(
  ({
    item,
    styles,
    selectionVisible,
    isSelected,
    onPressRow,
    onLongPressRow,
    animation,
    selectionShift,
  }) => {
    const handlePress = useCallback(() => {
      onPressRow(item.id);
    }, [item.id, onPressRow]);

    const handleLongPress = useCallback(() => {
      onLongPressRow(item.id);
    }, [item.id, onLongPressRow]);

    const checkboxTranslateX = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [-selectionShift, 0],
    });

    const contentTranslateX = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, selectionShift],
    });

    return (
      <TouchableOpacity
        style={[
          styles.content,
          selectionVisible ? styles.contentSelection : null,
          isSelected ? styles.contentSelected : null,
        ]}
        onPress={handlePress}
        onLongPress={handleLongPress}
        accessibilityRole="button"
        activeOpacity={0.5}
      >
        <>
          {selectionVisible ? (
            <Animated.View
              style={[
                styles.checkboxContainer,
                {
                  opacity: animation,
                  transform: [{translateX: checkboxTranslateX}],
                },
              ]}
            >
              <Checkbox.Android status={isSelected ? 'checked' : 'unchecked'} />
            </Animated.View>
          ) : null}

          <Animated.View
            style={[
              styles.rowContainer,
              {transform: [{translateX: contentTranslateX}]},
            ]}
          >
            <View style={styles.iconContainer}>
              <Icon
                name={item.fileIcon.name}
                size="lg"
                colorToken={item.fileIcon.colorToken}
                symbolType={item.fileIcon.symbolType}
                symbolColorTokens={item.fileIcon.symbolColorTokens}
              />
            </View>

            <View style={styles.textContainer}>
              <ThemedText
                variant="label"
                numberOfLines={1}
                ellipsizeMode="middle"
                style={styles.title}
              >
                {item.uiTitle}
              </ThemedText>

              <ThemedText numberOfLines={1} style={styles.description}>
                {item.uiDescription}
              </ThemedText>
            </View>
          </Animated.View>
        </>
      </TouchableOpacity>
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
    const {triggerHaptic} = useHaptic();
    const styles = createStyles(ds, theme);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(
      () => new Set(),
    );
    const isSelectionMode = selectedIds.size > 0;
    const [selectionVisible, setSelectionVisible] = useState(false);
    const selectionAnimation = useRef(new Animated.Value(0)).current;
    const selectionShift = ds.spacing.xxl + ds.spacing.md;

    useEffect(() => {
      if (isSelectionMode) {
        setSelectionVisible(true);
        Animated.timing(selectionAnimation, {
          toValue: 1,
          duration: 230,
          useNativeDriver: true,
        }).start();
        return;
      }

      Animated.timing(selectionAnimation, {
        toValue: 0,
        duration: 230,
        useNativeDriver: true,
      }).start(({finished}) => {
        if (finished) setSelectionVisible(false);
      });
    }, [isSelectionMode, selectionAnimation, selectionShift]);

    const clearSelection = useCallback(() => {
      const empty = new Set<string>();
      setSelectedIds(empty);
      onSelectionChange?.(empty);
    }, [onSelectionChange]);

    useImperativeHandle(ref, () => ({clearSelection}), [clearSelection]);

    const toggleSelected = useCallback(
      (id: string) => {
        triggerHaptic('light');
        setSelectedIds((prev) => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          onSelectionChange?.(next);
          return next;
        });
      },
      [onSelectionChange, triggerHaptic],
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
        const fileTypeRaw = d.extension ?? d.file_type ?? 'Unknown';
        const dateAdded = d.created_at ? formatDateShort(d.created_at) : '—';
        const title = d.original_filename ?? d.filename ?? 'Untitled';

        return {
          id: d.id,
          uiTitle: title,
          uiDescription: `${dateAdded} • ${String(fileTypeRaw).toUpperCase()} • ${fileSize}`,
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
          selectionVisible={selectionVisible}
          isSelected={selectedIds.has(item.id)}
          onPressRow={handlePressRow}
          onLongPressRow={handleLongPressRow}
          animation={selectionAnimation}
          selectionShift={selectionShift}
        />
      ),
      [
        styles,
        selectionVisible,
        selectedIds,
        handlePressRow,
        handleLongPressRow,
        selectionAnimation,
        selectionShift,
      ],
    );

    const keyExtractor = useCallback((item: DocumentRow) => item.id, []);

    const ItemSeparator = useCallback(
      () => <Divider style={styles.divider} />,
      [styles.divider],
    );

    const ListHeader = useCallback(
      () => <Divider style={styles.titleDivider} leftInset />,
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
        paddingVertical: ds.spacing.lg,
        paddingHorizontal: ds.spacing.lg,
        marginVertical: -0.2,
      },

      contentSelection: {
        paddingRight: ds.spacing.lg + ds.spacing.xxl + ds.spacing.sm,
      },

      contentSelected: {
        backgroundColor: theme.iosLightGray,
      },

      rowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
      },

      checkboxContainer: {
        position: 'absolute',
        left: ds.spacing.lg,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        width: ds.spacing.xxl + ds.spacing.sm,
        alignItems: 'center',
      },

      iconContainer: {
        width: ds.spacing.xxl + ds.spacing.sm,
        alignItems: 'center',
        justifyContent: 'center',
        transform: Platform.OS === 'android' ? [{scale: 1.4}] : [{scale: 1.7}],
      },

      textContainer: {
        flex: 1,
        minWidth: 0,
        marginLeft: ds.spacing.md,
      },

      title: {
        marginBottom: ds.spacing.xs,
      },

      description: {
        color: theme.muted,
        fontSize: ds.typography.caption.fontSize,
      },

      divider: {
        marginLeft:
          ds.spacing.lg + (ds.spacing.xxl + ds.spacing.sm) + ds.spacing.md,
        marginRight: ds.spacing.lg,
      },

      dividerSelected: {
        backgroundColor: theme.iosPlaceholder,
      },

      titleDivider: {
        marginRight: ds.spacing.lg,
        marginTop: ds.spacing.lg,
        color: theme.iosPlaceholder,
        opacity: 0.8,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
