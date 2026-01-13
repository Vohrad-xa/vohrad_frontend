import {useCallback, useMemo, memo, useState, useRef, useEffect} from 'react';
import {Animated, Platform, StyleSheet, View, Pressable} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import {type ItemAttachment} from '@sykamore/types';
import {Image} from 'expo-image';
import {Checkbox, Divider} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ThemedText, EmptyState} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape, Palette} from '@/constants';
import {ListCountFooter, ListStatusHeader} from '@/features/shared';
import {usePullToRefresh} from '@/hooks';
import {useTheme, useHaptic} from '@/providers';
import {
  makeStyleFactory,
  formatDateShort,
  formatBytes,
  getAttachmentFileIcon,
  Icon,
  AppIcons,
} from '@/utils';
import {resolveAttachmentThumbnailUrl} from '../utils';
import type {AttachmentsSelectionController} from '../hooks';

/**
 * Shared attachment list view with optional selection state.
 */
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
  selection: AttachmentsSelectionController<ItemAttachment>;
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
  rippleColor: string;
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
    rippleColor,
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
        android_ripple={{color: rippleColor, foreground: true}}
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
              rippleColor={rippleColor}
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
                  fontWeight={fileIcon.fontWeight}
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
            top: insets.top + 106,
            bottom: insets.bottom + 45,
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
        rippleColor={theme.ripple}
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
      theme.ripple,
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

  const ListEmpty = useCallback(
    () => <EmptyState message="No Records Found" icon={AppIcons.files.empty} />,
    [],
  );

  const listFooter = useMemo(
    () => (
      <ListCountFooter
        count={attachments.length}
        dividerStyle={styles.divider}
      />
    ),
    [attachments.length, styles.divider],
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
      refreshing={refreshing}
      onRefresh={handleRefresh}
      onEndReached={onEndReached}
      onStartReachedThreshold={0.2}
      onEndReachedThreshold={onEndReachedThreshold}
      ItemSeparatorComponent={ItemSeparator}
      ListHeaderComponent={ListHeader}
      ListEmptyComponent={
        attachments.length === 0 && !isLoading ? ListEmpty : null
      }
      ListFooterComponent={attachments.length > 0 ? listFooter : null}
      maintainVisibleContentPosition={{disabled: true}}
      automaticallyAdjustContentInsets={false}
      progressViewOffset={ds.spacing.lg}
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
 */
export function SelectableAttachmentsList({
  onAttachmentPress,
  attachments,
  onEndReached,
  onEndReachedThreshold,
  onRefresh,
  isLoading = false,
  lastUpdated = null,
  listKey = 'attachments',
  selection,
}: SelectableAttachmentsListProps) {
  const {ds} = useTheme();
  const {triggerHaptic} = useHaptic();

  const selectionMode = selection.isSelectionMode;
  const [selectionVisible, setSelectionVisible] = useState(false);

  const selectionAnimation = useRef(new Animated.Value(0)).current;
  const selectionShift = ds.spacing.xxxl + ds.spacing.xxs;

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

  const handlePressRow = useCallback(
    (id: string) => {
      if (selectionMode) {
        triggerHaptic('light');
        selection.toggleSelection(id);
        return;
      }
      onAttachmentPress(id);
    },
    [selectionMode, selection, triggerHaptic, onAttachmentPress],
  );

  const handleLongPressRow = useCallback(
    (id: string) => {
      selection.enableSelectionMode();
      triggerHaptic('light');
      selection.toggleSelection(id);
    },
    [selection, triggerHaptic],
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
      isSelected: selection.isSelected,
      onLongPress: handleLongPressRow,
      opacity: selectionAnimation,
      checkboxTranslateX,
      contentTranslateX,
    }),
    [
      selectionVisible,
      selection.isSelected,
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
      extraDataKey={`${selection.selectionVersion}|${selectionMode ? 1 : 0}`}
    />
  );
}

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
        marginRight: ds.spacing.lg,
      },

      contentPressed: {
        backgroundColor: theme.ripple,
      },

      contentSelected: {
        backgroundColor: theme.selected,
      },
      iconScale: {
        transform: Platform.OS === 'android' ? [{scale: 1.4}] : [{scale: 1.8}],
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
