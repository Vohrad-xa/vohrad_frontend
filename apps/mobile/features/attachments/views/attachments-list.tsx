import {useCallback, useMemo, memo, useState, useRef, useEffect} from 'react';
import {Animated, Platform, Pressable, StyleSheet, View} from 'react-native';
import {useHeaderHeight} from '@react-navigation/elements';
import {FlashList} from '@shopify/flash-list';
import {Checkbox} from 'expo-checkbox';
import {Image} from 'expo-image';
import {Divider} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ThemedText, EmptyState} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants';
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

type AnimatedNumber =
  | Animated.Value
  | Animated.AnimatedInterpolation<number>
  | number;

type AttachmentListSelectionState = {
  isVisible: boolean;
  isSelected: (id: string) => boolean;
  checkboxOpacity: Animated.Value;
  checkboxScale: Animated.AnimatedInterpolation<number>;
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
  showCheckbox: boolean;
  isSelected: boolean;
  onPressRow: (id: string) => void;
  checkboxOpacity: AnimatedNumber;
  checkboxScale: AnimatedNumber;
  contentTranslateX: AnimatedNumber;
  rippleColor: string;
};

const AttachmentItem = memo<AttachmentItemProps>(
  ({
    item,
    styles,
    selectionVisible,
    showCheckbox,
    isSelected,
    onPressRow,
    checkboxOpacity,
    checkboxScale,
    contentTranslateX,
    rippleColor,
  }) => {
    const {uiTitle, uiDescription, thumbnailUrl, iconKey} = item;
    const fileIcon = getAttachmentFileIcon(iconKey);

    const handlePress = useCallback(
      () => onPressRow(item.id),
      [item.id, onPressRow],
    );

    return (
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        unstable_pressDelay={60}
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
        {showCheckbox ? (
          <Animated.View
            pointerEvents={selectionVisible ? 'auto' : 'none'}
            importantForAccessibility={
              selectionVisible ? 'auto' : 'no-hide-descendants'
            }
            style={[
              styles.checkboxContainer,
              {
                opacity: checkboxOpacity,
                transform: [{scale: checkboxScale}],
              },
            ]}
          >
            <Checkbox value={isSelected} onValueChange={handlePress} />
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
                transition={0}
                style={styles.thumbnail}
              />
            ) : (
              <Icon
                name={fileIcon.name}
                size="xxl"
                colorToken={fileIcon.colorToken}
                symbolType={fileIcon.symbolType}
                symbolColorTokens={fileIcon.symbolColorTokens}
                fontWeight={fileIcon.fontWeight}
              />
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

  const hasSelection = selectionState != null;
  const selectionVisible = selectionState?.isVisible ?? false;

  const checkboxOpacity: AnimatedNumber = selectionState?.checkboxOpacity ?? 0;

  const checkboxScale: AnimatedNumber = selectionState?.checkboxScale ?? 1;

  const contentTranslateX: AnimatedNumber =
    selectionState?.contentTranslateX ?? 0;

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
        showCheckbox={hasSelection}
        isSelected={isSelected(item.id)}
        onPressRow={onAttachmentPress}
        checkboxOpacity={checkboxOpacity}
        checkboxScale={checkboxScale}
        contentTranslateX={contentTranslateX}
        rippleColor={theme.ripple}
      />
    ),
    [
      styles,
      selectionVisible,
      hasSelection,
      isSelected,
      onAttachmentPress,
      checkboxOpacity,
      checkboxScale,
      contentTranslateX,
      theme.ripple,
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
    () => `${extraDataKey ?? ''}|${selectionVisible ? 1 : 0}|${fontScaleKey}`,
    [extraDataKey, selectionVisible, fontScaleKey],
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
      onEndReachedThreshold={onEndReachedThreshold}
      drawDistance={Platform.OS === 'android' ? ds.screen.height : undefined}
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

  const checkboxScale = useMemo(
    () =>
      selectionAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0.96, 1],
      }),
    [selectionAnimation],
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
      checkboxOpacity: selectionAnimation,
      checkboxScale,
      contentTranslateX,
    }),
    [
      selectionVisible,
      selection.isSelected,
      selectionAnimation,
      checkboxScale,
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
      extraDataKey={`${selection.selectionVersion}`}
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
        backgroundColor: 'transparent',
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
        width: ds.spacing.xxl + ds.spacing.md,
      },

      iconContainer: {
        height: ds.spacing.xl * 2 + ds.spacing.xxs,
        width: ds.spacing.xxl + ds.spacing.md,
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
        marginLeft: ds.spacing.xxxl + ds.spacing.xl + ds.spacing.xs,
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
