import {useCallback, useMemo, memo, useState, useRef, useEffect} from 'react';
import {Animated, Platform, Pressable, StyleSheet, View} from 'react-native';
import {useHeaderHeight} from '@react-navigation/elements';
import {FlashList} from '@shopify/flash-list';
import {Image} from 'expo-image';
import {Checkbox, Divider} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ThemedText, EmptyState} from '@/components/ui';
import {Palette, themeKey, type DSShape, type ThemeShape} from '@/constants';
import {ListCountFooter, ListStatusHeader} from '@/features/shared';
import {usePullToRefresh} from '@/hooks';
import {useTheme, useHaptic} from '@/providers';
import {makeStyleFactory, Icon, AppIcons, getAttachmentFileIcon} from '@/utils';
import type {AttachmentsSelectionController} from '../hooks';
import type {AttachmentDisplayItem} from '@sykamore/store';

/**
 * Shared attachment list view with optional selection state.
 */
type AttachmentsListProps = {
  onAttachmentPress: (attachmentId: string) => void;
  attachments: AttachmentDisplayItem[];
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  onRefresh?: () => Promise<void> | void;
  isLoading?: boolean;
  lastUpdated?: Date | null;
  listKey?: string;
  applyHeaderContentInset?: boolean;
};

type SelectableAttachmentsListProps = AttachmentsListProps & {
  selection: AttachmentsSelectionController<AttachmentDisplayItem>;
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
  applyHeaderContentInset?: boolean;
};

type AttachmentItemProps = {
  item: AttachmentDisplayItem;
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
    checkboxColor,
    checkboxTranslateX,
    contentTranslateX,
  }) => {
    const {uiTitle, uiDescription, thumbnailUrl, iconKey} = item;
    const fileIcon = getAttachmentFileIcon(iconKey);

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
        style={({pressed}) => [
          styles.content,
          selectionVisible ? styles.contentSelection : null,
          isSelected ? styles.contentSelected : null,
          pressed && !selectionVisible ? styles.contentPressed : null,
        ]}
      >
        {selectionVisible ? (
          <Animated.View
            style={[
              styles.checkboxContainer,
              {
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
            {thumbnailUrl ? (
              <Image
                source={{uri: thumbnailUrl}}
                recyclingKey={item.id}
                cachePolicy="memory-disk"
                contentFit="cover"
                style={styles.thumbnail}
              />
            ) : (
              <View style={styles.iconContainer}>
                <Icon
                  name={fileIcon.name}
                  size="xxl"
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
              numberOfLines={1}
              ellipsizeMode="middle"
              style={styles.title}
            >
              {uiTitle}
            </ThemedText>

            <ThemedText
              allowFontScaling
              numberOfLines={1}
              variant="footnote"
              colorToken="muted"
              fontWeight="medium"
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
  applyHeaderContentInset = false,
}: AttachmentsListBaseProps) => {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);
  const {refreshing, onRefresh: handleRefresh} = usePullToRefresh({onRefresh});

  // iOS (transparent + large title): keep scroll indicator stable by forcing a fixed inset.
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const iosIndicatorProps =
    Platform.OS === 'ios' && applyHeaderContentInset
      ? {
          automaticallyAdjustsScrollIndicatorInsets: false as const,
          scrollIndicatorInsets: {
            top: headerHeight,
            bottom: insets.bottom + 45,
          },
          contentInset: {
            top: headerHeight,
            bottom: insets.bottom + 45,
          },
          contentOffset: {
            x: 0,
            y: -headerHeight,
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

  const isSelected = useCallback(
    (id: string) => selectionState?.isSelected(id) ?? false,
    [selectionState],
  );

  const renderItem = useCallback(
    ({item}: {item: AttachmentDisplayItem}) => (
      <AttachmentItem
        item={item}
        styles={styles}
        selectionVisible={selectionVisible}
        isSelected={isSelected(item.id)}
        onPressRow={onAttachmentPress}
        onLongPressRow={onLongPressRow}
        opacity={selectionOpacity}
        checkboxTranslateX={checkboxTranslateX}
        contentTranslateX={contentTranslateX}
        checkboxColor={Palette.blue}
      />
    ),
    [
      styles,
      selectionVisible,
      isSelected,
      onAttachmentPress,
      onLongPressRow,
      selectionOpacity,
      checkboxTranslateX,
      contentTranslateX,
      Palette.blue,
    ],
  );

  const keyExtractor = useCallback(
    (item: AttachmentDisplayItem) => item.id,
    [],
  );

  const ItemSeparator = useCallback(
    () => <Divider style={styles.divider} />,
    [styles.divider],
  );

  const ListHeader = useCallback(
    () => <ListStatusHeader isLoading={isLoading} lastUpdated={lastUpdated} />,
    [isLoading, lastUpdated],
  );

  const ListEmpty = useCallback(
    () => (
      <EmptyState message="No Records Found" icon={AppIcons.emptyStates.file} />
    ),
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
      onStartReachedThreshold={0.5}
      onEndReachedThreshold={onEndReachedThreshold}
      drawDistance={
        Platform.OS === 'android' ? ds.screen.height * 1.5 : undefined
      }
      ItemSeparatorComponent={ItemSeparator}
      ListHeaderComponent={ListHeader}
      ListEmptyComponent={
        attachments.length === 0 && !isLoading ? ListEmpty : null
      }
      ListFooterComponent={attachments.length > 0 ? listFooter : null}
      maintainVisibleContentPosition={{disabled: true}}
      automaticallyAdjustContentInsets={false}
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
  const selectionShift = ds.spacing.xxxl;

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
        justifyContent: 'center',
        alignItems: 'center',
        left: ds.spacing.lg,
        top: 0,
        bottom: 0,
        width: ds.spacing.xxl + ds.spacing.sm,
      },

      iconContainer: {
        height: ds.spacing.xl * 2 + ds.spacing.xxs,
        width: ds.spacing.xxl + ds.spacing.sm,
        alignItems: 'center',
        justifyContent: 'center',
      },

      thumbnail: {
        width: ds.spacing.xl + ds.spacing.sm,
        height: ds.spacing.xl * 2 + ds.spacing.xxs,
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
        marginLeft: ds.spacing.xxxl + ds.spacing.xl + ds.spacing.xxs,
        marginRight: ds.spacing.lg,
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
