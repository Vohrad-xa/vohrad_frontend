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
import {usePullToRefresh} from '@/hooks';
import {useTheme, useHaptic} from '@/providers';
import {
  makeStyleFactory,
  formatDateShort,
  formatBytes,
  getAttachmentFileIcon,
  type AttachmentIcon,
  Icon,
} from '@/utils';
import {ListCountFooter, ListStatusHeader} from '../components';

/**
 * Imperative selection controls consumed by parent navigation/header flows.
 *
 * - Always drive both local state and `onSelectionChange` so callers can treat
 *   the ref as the single entry point for bulk operations.
 */
export type DocumentsListRef = {
  clearSelection: () => void;
  enterSelectionMode: () => void;
  selectAll: () => void;
  deselectAll: () => void;
};

type DocumentsListProps = {
  onDocumentPress: (documentId: string) => void;
  documents: ItemAttachment[];
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  onSelectionChange?: (selectedIds: Set<string>) => void;
  onRefresh?: () => Promise<void> | void;
  isLoading?: boolean;
  lastUpdated?: Date | null;
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
  opacity: Animated.Value;
  checkboxColor: string;
  checkboxTranslateX: Animated.AnimatedInterpolation<number>;
  contentTranslateX: Animated.AnimatedInterpolation<number>;
};

const DocumentItem = memo<DocumentItemProps>(
  ({
    item,
    styles,
    selectionVisible,
    isSelected,
    onPressRow,
    onLongPressRow,
    opacity,
    checkboxColor,
    checkboxTranslateX,
    contentTranslateX,
  }) => {
    const handlePress = useCallback(
      () => onPressRow(item.id),
      [item.id, onPressRow],
    );
    const handleLongPress = useCallback(
      () => onLongPressRow(item.id),
      [item.id, onLongPressRow],
    );

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
        {selectionVisible ? (
          <Animated.View
            style={[
              styles.checkboxContainer,
              {
                opacity,
                transform: [{translateX: checkboxTranslateX}],
              },
            ]}
          >
            <Checkbox.Android
              status={isSelected ? 'checked' : 'unchecked'}
              color={checkboxColor}
            />
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
              allowFontScaling
              variant="body"
              numberOfLines={1}
              ellipsizeMode="middle"
              style={styles.title}
            >
              {item.uiTitle}
            </ThemedText>

            <ThemedText allowFontScaling variant="caption" numberOfLines={1}>
              {item.uiDescription}
            </ThemedText>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  },
);

DocumentItem.displayName = 'DocumentItem';

/**
 * FlashList-backed document list with animated multi-select UX.
 *
 * - Owns selection state + animations; parent reacts via `onSelectionChange`
 *   and the `DocumentsListRef` contract only.
 * - Treats `selectionMode` as a derived flag to keep header/layout decisions
 *   simple while still supporting "empty" selection mode.
 * - Bakes font scale into `key`/`extraData` so layout re-measures correctly
 *   when the OS text size changes.
 */
export const DocumentsList = forwardRef<DocumentsListRef, DocumentsListProps>(
  (
    {
      onDocumentPress,
      documents,
      onEndReached,
      onEndReachedThreshold,
      onSelectionChange,
      onRefresh,
      isLoading = false,
      lastUpdated = null,
    },
    ref,
  ) => {
    const {ds, theme} = useTheme();
    const {triggerHaptic} = useHaptic();
    const styles = createStyles(ds, theme);
    const {refreshing, onRefresh: handleRefresh} = usePullToRefresh({
      onRefresh,
    });

    const fontScaleKey = ds.screen?.fontScale ?? 1;

    const [selectedIds, setSelectedIds] = useState<Set<string>>(
      () => new Set(),
    );

    const [forceSelectionMode, setForceSelectionMode] = useState(false);
    const selectionMode = forceSelectionMode || selectedIds.size > 0;

    const [selectionVisible, setSelectionVisible] = useState(false);
    const selectionAnimation = useRef(new Animated.Value(0)).current;
    const selectionShift = ds.spacing.xxl + ds.spacing.md;

    useEffect(() => {
      // Delay hiding checkboxes until the closing animation finishes to avoid flicker
      if (selectionMode) {
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
    }, [selectionMode, selectionAnimation]);

    const clearSelection = useCallback(() => {
      const empty = new Set<string>();
      setSelectedIds(empty);
      setForceSelectionMode(false);
      onSelectionChange?.(empty);
    }, [onSelectionChange]);

    const selectAll = useCallback(() => {
      if (documents.length === 0) return;
      const all = new Set(documents.map((doc) => doc.id));
      setSelectedIds(all);
      setForceSelectionMode(true);
      onSelectionChange?.(all);
    }, [documents, onSelectionChange]);

    const deselectAll = useCallback(() => {
      // Keep forceSelectionMode true so the parent header can offer "Select All" again
      const empty = new Set<string>();
      setSelectedIds(empty);
      setForceSelectionMode(true);
      onSelectionChange?.(empty);
    }, [onSelectionChange]);

    const enterSelectionMode = useCallback(() => {
      if (!selectionMode) setForceSelectionMode(true);
    }, [selectionMode]);

    useImperativeHandle(
      ref,
      () => ({clearSelection, enterSelectionMode, selectAll, deselectAll}),
      [clearSelection, enterSelectionMode, selectAll, deselectAll],
    );

    const toggleSelected = useCallback(
      (id: string) => {
        triggerHaptic('light');

        setSelectedIds((prev) => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);

          if (prev.size === 0 && next.size === 1) setForceSelectionMode(true);

          onSelectionChange?.(next);
          return next;
        });
      },
      [onSelectionChange, triggerHaptic],
    );

    const handlePressRow = useCallback(
      (id: string) => {
        if (selectionMode) {
          toggleSelected(id);
          return;
        }
        onDocumentPress(id);
      },
      [selectionMode, toggleSelected, onDocumentPress],
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
        const dateAdded = d.created_at ? formatDateShort(d.created_at) : '—';
        const title = d.original_filename ?? d.filename ?? 'Untitled';

        return {
          id: d.id,
          uiTitle: title,
          uiDescription: `${dateAdded} - ${fileSize}`,
          fileIcon: getAttachmentFileIcon({
            filename: title,
            extension: d.extension ?? null,
            fileType: d.file_type ?? null,
          }),
        };
      });
    }, [documents]);

    const checkboxTranslateX = useMemo(
      () =>
        selectionAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [-selectionShift, 0],
        }),
      [selectionAnimation, selectionShift],
    );

    const contentTranslateX = useMemo(
      () =>
        selectionAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, selectionShift],
        }),
      [selectionAnimation, selectionShift],
    );

    const checkboxColor = theme.accentBlue;

    const renderItem = useCallback(
      ({item}: {item: DocumentRow}) => (
        <DocumentItem
          item={item}
          styles={styles}
          selectionVisible={selectionVisible}
          isSelected={selectedIds.has(item.id)}
          onPressRow={handlePressRow}
          onLongPressRow={handleLongPressRow}
          opacity={selectionAnimation}
          checkboxColor={checkboxColor}
          checkboxTranslateX={checkboxTranslateX}
          contentTranslateX={contentTranslateX}
        />
      ),
      [
        styles,
        selectionVisible,
        selectedIds,
        handlePressRow,
        handleLongPressRow,
        selectionAnimation,
        checkboxColor,
        checkboxTranslateX,
        contentTranslateX,
      ],
    );

    const keyExtractor = useCallback((item: DocumentRow) => item.id, []);

    const ItemSeparator = useCallback(
      () => <Divider style={styles.divider} />,
      [styles.divider],
    );

    const ListHeader = useCallback(
      () => (
        <ListStatusHeader isLoading={isLoading} lastUpdated={lastUpdated} />
      ),
      [isLoading, lastUpdated],
    );

    const extraData = useMemo(
      () =>
        `${selectedIds.size}|${selectionMode ? 1 : 0}|${fontScaleKey}|${
          isLoading ? 1 : 0
        }|${lastUpdated ? lastUpdated.getTime() : 0}`,
      [selectedIds.size, selectionMode, fontScaleKey, isLoading, lastUpdated],
    );

    return (
      <FlashList
        key={`documents-${fontScaleKey}`}
        data={files}
        extraData={extraData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onEndReached={onEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
        ItemSeparatorComponent={ItemSeparator}
        ListHeaderComponent={ListHeader}
        contentInsetAdjustmentBehavior="always"
        refreshing={refreshing}
        onRefresh={handleRefresh}
        progressViewOffset={ds.spacing.lg}
        maintainVisibleContentPosition={{disabled: true}}
        ListFooterComponent={
          <ListCountFooter
            count={files.length}
            dividerStyle={styles.divider}
            containerStyle={styles.footer}
            textVariant="callout"
            fontWeight="bold"
          />
        }
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
        backgroundColor: theme.selected,
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
        paddingBottom: ds.spacing.xs,
      },

      divider: {
        marginLeft:
          ds.spacing.lg + (ds.spacing.xxl + ds.spacing.sm) + ds.spacing.md,
        marginRight: ds.spacing.lg,
      },

      footer: {
        paddingTop: ds.spacing.xxl,
        paddingBottom: ds.spacing.xl,
        alignItems: 'center',
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
