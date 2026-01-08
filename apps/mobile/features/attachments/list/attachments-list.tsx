import {
  useCallback,
  useMemo,
  memo,
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
} from 'react';
import {Animated, Platform, StyleSheet, View, Pressable} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import {type ItemAttachment} from '@sykamore/types';
import {Image} from 'expo-image';
import {Checkbox, Divider} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ThemedText} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape, Palette} from '@/constants';
import {resolveAttachmentThumbnailUrl} from '@/features/attachments/utils';
import {ListCountFooter, ListStatusHeader} from '@/features/shared';
import {usePullToRefresh} from '@/hooks';
import {useTheme, useHaptic} from '@/providers';
import {
  makeStyleFactory,
  formatDateShort,
  formatBytes,
  getAttachmentFileIcon,
  Icon,
} from '@/utils';

/**
 * Imperative selection controls consumed by parent navigation/header flows.
 *
 * - Always drive both local state and `onSelectionChange` so callers can treat
 *   the ref as the single entry point for bulk operations.
 */
export type SelectableAttachmentsListRef = {
  clearSelection: () => void;
  enterSelectionMode: () => void;
  selectAll: () => void;
  deselectAll: () => void;
};

type AttachmentsListProps = {
  onAttachmentPress: (attachmentId: string) => void;
  attachments: ItemAttachment[];
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  onRefresh?: () => Promise<void> | void;
  isLoading?: boolean;
  lastUpdated?: Date | null;
  listKey?: string;
};

type SelectableAttachmentsListProps = AttachmentsListProps & {
  onSelectionChange?: (selectedIds: Set<string>) => void;
};

type AttachmentListSelectionState = {
  isVisible: boolean;
  isSelected: (id: string) => boolean;
  onLongPress: (id: string) => void;
  opacity: Animated.Value;
  checkboxTranslateX: Animated.AnimatedInterpolation<number>;
  contentTranslateX: Animated.AnimatedInterpolation<number>;
};

type AttachmentsListBaseProps = AttachmentsListProps & {
  selectionState?: AttachmentListSelectionState | null;
  extraDataKey?: string;
};

type AttachmentItemProps = {
  item: ItemAttachment;
  styles: ReturnType<typeof createStyles>;
  selectionVisible: boolean;
  isSelected: boolean;
  onPressRow: (id: string) => void;
  onLongPressRow?: (id: string) => void;
  opacity: Animated.Value;
  checkboxColor: string;
  checkboxTranslateX: Animated.AnimatedInterpolation<number>;
  contentTranslateX: Animated.AnimatedInterpolation<number>;
};

const AttachmentItem = memo<AttachmentItemProps>(
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
    const {uiTitle, uiDescription, fileIcon, thumbnailSource} = useMemo(() => {
      const title = item.original_filename ?? item.filename ?? 'Untitled';

      const fileSize = formatBytes(Number(item.size));

      const dateAdded = item.created_at
        ? formatDateShort(item.created_at)
        : '—';

      const fileType = item.file_type?.toLowerCase() ?? '';

      const normalizedExtension = (item.extension ?? '')
        .toLowerCase()
        .replace(/^\./, '');

      const isPdf =
        fileType === 'application/pdf' || normalizedExtension === 'pdf';

      const isImage =
        (item.kind ?? '').toLowerCase() === 'image' ||
        fileType.startsWith('image/');

      const thumbnailUrl =
        isPdf || isImage ? resolveAttachmentThumbnailUrl(item) : null;

      const icon = getAttachmentFileIcon({
        filename: title,
        extension: item.extension ?? null,
        fileType: item.file_type ?? null,
      });

      return {
        uiTitle: title,
        uiDescription: `${dateAdded} - ${fileSize}`,
        fileIcon: icon,
        thumbnailSource: thumbnailUrl ?? null,
      };
    }, [item]);

    const handlePress = useCallback(
      () => onPressRow(item.id),
      [item.id, onPressRow],
    );

    const handleLongPress = useCallback(() => {
      if (onLongPressRow) {
        onLongPressRow(item.id);
      }
    }, [item.id, onLongPressRow]);

    return (
      <Pressable
        onPress={handlePress}
        onLongPress={onLongPressRow ? handleLongPress : undefined}
        accessibilityRole="button"
        delayLongPress={500}
        focusable
        style={({pressed}) => [
          styles.content,
          selectionVisible ? styles.contentSelection : null,
          isSelected ? styles.contentSelected : null,
          pressed && Platform.OS === 'ios' && !selectionVisible
            ? styles.contentPressed
            : null,
        ]}
        android_ripple={{color: Palette.ripple, foreground: true}}
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
            {thumbnailSource ? (
              <Image
                source={{uri: thumbnailSource, cacheKey: `${item.id}:thumb`}}
                style={styles.thumbnail}
                contentFit="cover"
                cachePolicy="memory-disk"
                recyclingKey={item.id}
                decodeFormat="argb"
                enforceEarlyResizing
              />
            ) : (
              <View style={styles.iconScale}>
                <Icon
                  name={fileIcon.name}
                  size="lg"
                  colorToken={fileIcon.colorToken}
                  symbolType={fileIcon.symbolType}
                  symbolColorTokens={fileIcon.symbolColorTokens}
                />
              </View>
            )}
          </View>

          <View style={styles.textContainer}>
            <ThemedText
              allowFontScaling
              variant="body"
              fontWeight="regular"
              numberOfLines={1}
              ellipsizeMode="middle"
              style={styles.title}
            >
              {uiTitle}
            </ThemedText>

            <ThemedText
              allowFontScaling
              variant="footnote"
              colorToken="muted"
              fontWeight="medium"
              numberOfLines={1}
            >
              {uiDescription}
            </ThemedText>
          </View>
        </Animated.View>
      </Pressable>
    );
  },
);

AttachmentItem.displayName = 'AttachmentItem';

const AttachmentsListBase = ({
  onAttachmentPress,
  attachments,
  onEndReached,
  onEndReachedThreshold,
  onRefresh,
  isLoading = false,
  lastUpdated = null,
  listKey = 'attachments',
  selectionState = null,
  extraDataKey,
}: AttachmentsListBaseProps) => {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);
  const {refreshing, onRefresh: handleRefresh} = usePullToRefresh({onRefresh});

  // iOS (transparent + large title): keep scroll indicator stable by forcing a fixed inset.
  const insets = useSafeAreaInsets();
  const iosIndicatorProps =
    Platform.OS === 'ios'
      ? {
          automaticallyAdjustsScrollIndicatorInsets: false as const,
          scrollIndicatorInsets: {
            top: insets.top + 106, // large title height
            bottom: 80,
          },
        }
      : {};

  const fontScaleKey = ds.screen?.fontScale ?? 1;

  const zeroAnimation = useRef(new Animated.Value(0)).current;

  const zeroTranslate = useMemo(
    () =>
      zeroAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0],
      }),
    [zeroAnimation],
  );

  const selectionVisible = selectionState?.isVisible ?? false;

  const onLongPressRow = selectionState?.onLongPress;

  const checkboxTranslateX =
    selectionState?.checkboxTranslateX ?? zeroTranslate;

  const contentTranslateX = selectionState?.contentTranslateX ?? zeroTranslate;

  const selectionOpacity = selectionState?.opacity ?? zeroAnimation;

  const checkboxColor = theme.accentBlue;

  const isSelected = useCallback(
    (id: string) => selectionState?.isSelected(id) ?? false,
    [selectionState],
  );

  const renderItem = useCallback(
    ({item}: {item: ItemAttachment}) => (
      <AttachmentItem
        item={item}
        styles={styles}
        selectionVisible={selectionVisible}
        isSelected={isSelected(item.id)}
        onPressRow={onAttachmentPress}
        onLongPressRow={onLongPressRow}
        opacity={selectionOpacity}
        checkboxColor={checkboxColor}
        checkboxTranslateX={checkboxTranslateX}
        contentTranslateX={contentTranslateX}
      />
    ),
    [
      styles,
      selectionVisible,
      isSelected,
      onAttachmentPress,
      onLongPressRow,
      selectionOpacity,
      checkboxColor,
      checkboxTranslateX,
      contentTranslateX,
    ],
  );

  const keyExtractor = useCallback((item: ItemAttachment) => item.id, []);

  const ItemSeparator = useCallback(
    () => <Divider style={styles.divider} />,
    [styles.divider],
  );

  const ListHeader = useCallback(
    () => <ListStatusHeader isLoading={isLoading} lastUpdated={lastUpdated} />,
    [isLoading, lastUpdated],
  );

  const listFooter = useMemo(
    () => (
      <ListCountFooter
        count={attachments.length}
        dividerStyle={styles.divider}
        containerStyle={styles.footer}
        textVariant="callout"
        fontWeight="bold"
      />
    ),
    [attachments.length, styles.divider, styles.footer],
  );

  const extraData = useMemo(
    () =>
      `${extraDataKey ?? ''}|${selectionVisible ? 1 : 0}|${fontScaleKey}|${
        isLoading ? 1 : 0
      }|${lastUpdated ? lastUpdated.getTime() : 0}`,
    [extraDataKey, selectionVisible, fontScaleKey, isLoading, lastUpdated],
  );

  return (
    <FlashList
      {...iosIndicatorProps}
      key={`${listKey}-${fontScaleKey}`}
      data={attachments}
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
      ListFooterComponent={listFooter}
      automaticallyAdjustContentInsets
      role="listitem"
    />
  );
};

/**
 * Read-only attachment list for non-selection flows (search, previews).
 */
export function AttachmentsList(props: AttachmentsListProps) {
  return <AttachmentsListBase {...props} />;
}

/**
 * FlashList-backed attachment list with animated multi-select UX.
 *
 * - Owns selection state + animations; parent reacts via `onSelectionChange`
 *   and the `SelectableAttachmentsListRef` contract only.
 * - Treats `selectionMode` as a derived flag to keep header/layout decisions
 *   simple while still supporting "empty" selection mode.
 * - Bakes font scale into `key`/`extraData` so layout re-measures correctly
 *   when the OS text size changes.
 */
export const SelectableAttachmentsList = forwardRef<
  SelectableAttachmentsListRef,
  SelectableAttachmentsListProps
>(
  (
    {
      onAttachmentPress,
      attachments,
      onEndReached,
      onEndReachedThreshold,
      onSelectionChange,
      onRefresh,
      isLoading = false,
      lastUpdated = null,
      listKey = 'attachments',
    },
    ref,
  ) => {
    const {ds} = useTheme();

    const {triggerHaptic} = useHaptic();

    const [selectedIds, setSelectedIds] = useState<Set<string>>(
      () => new Set(),
    );
    const [selectionRevision, setSelectionRevision] = useState(0);

    const [forceSelectionMode, setForceSelectionMode] = useState(false);

    const selectionMode = forceSelectionMode || selectedIds.size > 0;

    const [selectionVisible, setSelectionVisible] = useState(false);

    const selectionAnimation = useRef(new Animated.Value(0)).current;

    const selectionShift = ds.spacing.xxxl + ds.spacing.xxs;

    const selectionDidMountRef = useRef(false);

    const onSelectionChangeRef = useRef(onSelectionChange);

    useEffect(() => {
      onSelectionChangeRef.current = onSelectionChange;
    }, [onSelectionChange]);

    useEffect(() => {
      if (!selectionDidMountRef.current) {
        selectionDidMountRef.current = true;
        return;
      }

      onSelectionChangeRef.current?.(selectedIds);

      if (selectedIds.size > 0) {
        setForceSelectionMode(true);
      }
    }, [selectedIds]);

    useEffect(() => {
      // Delay hiding checkboxes until the closing animation finishes to avoid flicker
      if (selectionMode) {
        setSelectionVisible(true);
        Animated.timing(selectionAnimation, {
          toValue: 1,
          duration: 160,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(selectionAnimation, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }).start(({finished}) => {
          if (finished) setSelectionVisible(false);
        });
      }
    }, [selectionMode, selectionAnimation]);

    const clearSelection = useCallback(() => {
      setSelectedIds(new Set());
      setSelectionRevision((prev) => prev + 1);
      setForceSelectionMode(false);
    }, []);

    const selectAll = useCallback(() => {
      const next = new Set(attachments.map((doc) => doc.id));
      setSelectedIds(next);
      setSelectionRevision((prev) => prev + 1);
      setForceSelectionMode(true);
    }, [attachments]);

    const deselectAll = useCallback(() => {
      setSelectedIds(new Set());
      setSelectionRevision((prev) => prev + 1);
      setForceSelectionMode(true);
    }, []);

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
          return next;
        });
        setSelectionRevision((prev) => prev + 1);
      },
      [triggerHaptic],
    );

    const handlePressRow = useCallback(
      (id: string) => {
        if (selectionMode) {
          toggleSelected(id);
          return;
        }
        onAttachmentPress(id);
      },
      [selectionMode, toggleSelected, onAttachmentPress],
    );

    const handleLongPressRow = useCallback(
      (id: string) => {
        toggleSelected(id);
      },
      [toggleSelected],
    );

    const isSelected = useCallback(
      (id: string) => selectedIds.has(id),
      [selectedIds],
    );

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

    const selectionState = useMemo<AttachmentListSelectionState>(
      () => ({
        isVisible: selectionVisible,
        isSelected,
        onLongPress: handleLongPressRow,
        opacity: selectionAnimation,
        checkboxTranslateX,
        contentTranslateX,
      }),
      [
        selectionVisible,
        isSelected,
        handleLongPressRow,
        selectionAnimation,
        checkboxTranslateX,
        contentTranslateX,
      ],
    );

    return (
      <AttachmentsListBase
        attachments={attachments}
        listKey={listKey}
        onAttachmentPress={handlePressRow}
        onEndReached={onEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
        onRefresh={onRefresh}
        isLoading={isLoading}
        lastUpdated={lastUpdated}
        selectionState={selectionState}
        extraDataKey={`${selectionRevision}|${selectionMode ? 1 : 0}`}
      />
    );
  },
);

SelectableAttachmentsList.displayName = 'SelectableAttachmentsList';

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      content: {
        paddingVertical: ds.spacing.md,
        paddingHorizontal: ds.spacing.lg,
        marginVertical: -0.2,
      },

      contentSelection: {
        paddingRight: ds.spacing.xxxl + ds.spacing.sm,
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
        width: ds.spacing.xxl + ds.spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 1,
        shadowColor: Palette.gray[600],
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 0.2,
        shadowRadius: 1,
      },

      iconScale: {
        transform: Platform.OS === 'android' ? [{scale: 1.4}] : [{scale: 1.8}],
      },

      thumbnail: {
        width: ds.spacing.xxl,
        height: ds.spacing.xxl + 10,
        borderRadius: ds.borderRadius.xs,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: theme.border,
      },

      textContainer: {
        flex: 1,
        minWidth: 0,
        marginLeft: ds.spacing.md,
      },

      title: {
        paddingBottom: ds.spacing.xs + 2,
      },

      divider: {
        marginLeft: ds.spacing.xxxl + ds.spacing.xl + ds.spacing.xs,
      },

      footer: {
        paddingTop: ds.spacing.xxl,
        paddingBottom: ds.spacing.xl,
        alignItems: 'center',
      },

      contentPressed: {
        backgroundColor: theme.ripple,
      },

      contentSelected: {
        backgroundColor: theme.selected,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
