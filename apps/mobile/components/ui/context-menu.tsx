import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type ListRenderItemInfo,
  type ViewStyle,
} from 'react-native';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {usePopupAnimation} from '@/hooks';
import {useTheme} from '@/providers';
import {triggerHaptic} from '@/utils/haptics';
import {makeStyleFactory} from '@/utils/style-factory';
import {GlassCard} from '../cards/glass-card';
import {ThemedText} from './themed-text';

type Frame = {x: number; y: number; width: number; height: number};
type MenuPosition = {top?: number; left?: number; width?: number};

export type ContextMenuItem = {
  label: string;
  onPress: () => void;
  isActive?: boolean;
  isDestructive?: boolean;
};

type ContextMenuProps = {
  items: ContextMenuItem[];
  isOpen: boolean;
  onClose: () => void;
  position?: MenuPosition;
  variant?: 'fullWidth' | 'compact';
  anchorRef?: React.RefObject<View | null>;
  containerRef?: React.RefObject<View | null>;
};

const COMPACT_MIN_WIDTH = 250;

const keyExtractor = (item: ContextMenuItem, index: number) =>
  `${item.label}-${index}`;

const ItemSeparator = () => {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);
  return <View style={styles.optionSeparator} />;
};

export function ContextMenu({
  items,
  isOpen,
  onClose,
  position,
  variant = 'fullWidth',
  anchorRef,
  containerRef,
}: ContextMenuProps) {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);
  const {animatedStyle, animateOut} = usePopupAnimation({isVisible: isOpen});

  const [anchorFrame, setAnchorFrame] = useState<Frame | null>(null);
  const [containerFrame, setContainerFrame] = useState<Frame | null>(null);
  const [canDismiss, setCanDismiss] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setAnchorFrame(null);
      setContainerFrame(null);
      setCanDismiss(false);
      return;
    }

    if (!anchorRef?.current) {
      return;
    }

    const measure = () => {
      anchorRef.current?.measureInWindow((x, y, width, height) => {
        setAnchorFrame({x, y, width, height});
      });

      if (containerRef?.current) {
        containerRef.current.measureInWindow((x, y, width, height) => {
          setContainerFrame({x, y, width, height});
        });
      } else {
        setContainerFrame(null);
      }
    };

    if (Platform.OS === 'web') {
      const frame = requestAnimationFrame(measure);
      return () => cancelAnimationFrame(frame);
    }

    measure();
  }, [anchorRef, containerRef, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setCanDismiss(false);
      return;
    }

    setCanDismiss(false);
    const timeout = setTimeout(() => {
      setCanDismiss(true);
    }, 60);

    return () => {
      clearTimeout(timeout);
    };
  }, [isOpen]);

  const defaultInset = Number(ds.spacing.lg ?? 20);
  const verticalOffset = Platform.OS === 'android' ? 26 : -4;
  const windowWidth = Dimensions.get('window').width;

  const leftBound = containerFrame?.x ?? defaultInset;
  const rightBound = containerFrame
    ? containerFrame.x + containerFrame.width
    : windowWidth - defaultInset;

  const clampLeft = useCallback(
    (left: number, width: number) => {
      const minLeft = leftBound;
      const maxLeft = Math.max(minLeft, rightBound - width);
      if (maxLeft <= minLeft) {
        return minLeft;
      }
      return Math.min(Math.max(left, minLeft), maxLeft);
    },
    [leftBound, rightBound],
  );

  const autoPosition = useMemo<MenuPosition>(() => {
    const fallbackTop = (ds.spacing.xl ?? 40) + verticalOffset;
    if (!anchorFrame) {
      if (variant === 'fullWidth') {
        return {
          top: fallbackTop,
          left: defaultInset,
          width: windowWidth - defaultInset * 2,
        };
      }
      return {top: fallbackTop, left: defaultInset};
    }

    const top = anchorFrame.y + anchorFrame.height + verticalOffset;
    if (variant === 'fullWidth') {
      const width = Math.max(rightBound - leftBound, COMPACT_MIN_WIDTH);
      const baseLeft = anchorFrame.x;
      const left = clampLeft(baseLeft, width);
      return {top, left, width};
    }

    const width = COMPACT_MIN_WIDTH;
    const baseLeft = anchorFrame.x + anchorFrame.width - width;
    const left = clampLeft(baseLeft, width);
    return {top, left};
  }, [
    anchorFrame,
    clampLeft,
    ds.spacing.xl,
    leftBound,
    rightBound,
    variant,
    verticalOffset,
    windowWidth,
    defaultInset,
  ]);

  const resolvedPosition: ViewStyle = useMemo(() => {
    const base = position ?? autoPosition;
    const style: ViewStyle = {
      position: 'absolute',
      top: base.top,
      left: base.left,
    };

    if (variant === 'fullWidth') {
      style.width =
        base.width ?? Math.max(rightBound - leftBound, COMPACT_MIN_WIDTH);
    } else {
      style.width = COMPACT_MIN_WIDTH;
    }

    return style;
  }, [autoPosition, leftBound, position, rightBound, variant]);

  const handleClose = useCallback(() => {
    if (!canDismiss) {
      return;
    }
    setCanDismiss(false);
    animateOut(onClose);
  }, [animateOut, canDismiss, onClose]);

  const handleItemPress = useCallback(
    (item: ContextMenuItem) => {
      void triggerHaptic('selection');
      setCanDismiss(false);
      animateOut(() => {
        onClose();
        item.onPress();
      });
    },
    [animateOut, onClose],
  );

  const renderItem = useCallback(
    ({item}: ListRenderItemInfo<ContextMenuItem>) => (
      <Pressable
        onPress={() => handleItemPress(item)}
        style={({pressed}) => [
          styles.optionRow,
          pressed && styles.optionRowPressed,
        ]}
      >
        <ThemedText
          style={[
            styles.optionLabel,
            item.isActive && styles.optionLabelActive,
            item.isDestructive && styles.optionLabelDestructive,
          ]}
          numberOfLines={2}
        >
          {item.label}
        </ThemedText>
      </Pressable>
    ),
    [handleItemPress, styles],
  );

  if (!isOpen) {
    return null;
  }

  const cardStyle =
    variant === 'fullWidth' ? styles.menuCardFullWidth : styles.menuCardCompact;

  const contentPaddingStyle = styles.menuContent;

  const list = (
    <FlatList
      data={items}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ItemSeparatorComponent={ItemSeparator}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      bounces={false}
    />
  );

  const menuSurface =
    Platform.OS === 'ios' ? (
      <GlassCard style={cardStyle} contentStyle={contentPaddingStyle}>
        {list}
      </GlassCard>
    ) : (
      <View style={[cardStyle, styles.menuFallback]}>
        <View style={contentPaddingStyle}>{list}</View>
      </View>
    );

  return (
    <Modal
      transparent
      animationType="none"
      visible
      statusBarTranslucent={Platform.OS === 'android'}
      onRequestClose={handleClose}
    >
      <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        <Pressable
          style={styles.tapArea}
          onPress={handleClose}
          pointerEvents={canDismiss ? 'auto' : 'none'}
        />

        <Animated.View
          style={[
            variant === 'compact'
              ? styles.menuWrapperCompact
              : styles.menuWrapper,
            resolvedPosition,
            animatedStyle,
          ]}
        >
          {menuSurface}
        </Animated.View>
      </View>
    </Modal>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      tapArea: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'transparent',
      },
      menuWrapper: {
        position: 'absolute',
      },
      menuWrapperCompact: {
        position: 'absolute',
        minWidth: COMPACT_MIN_WIDTH,
      },
      menuCardFullWidth: {
        borderRadius: ds.borderRadius.xxxl,
        marginHorizontal: ds.spacing.md,
      },
      menuCardCompact: {
        borderRadius: ds.borderRadius.xxxl,
        marginLeft: ds.spacing.md,
      },
      menuFallback: {
        backgroundColor: theme.background,
        borderRadius: ds.borderRadius.xxxl,
        borderWidth: Platform.select({
          ios: StyleSheet.hairlineWidth,
          android: StyleSheet.hairlineWidth,
          default: 1,
        }),
        borderColor: theme.border,
        overflow: 'hidden',
        boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.12)',
      },
      menuContent: {
        paddingHorizontal: ds.spacing.md,
        paddingVertical: ds.spacing.md,
      },
      optionRow: {
        paddingVertical: ds.spacing.sm,
        paddingHorizontal: ds.spacing.md,
        borderRadius: ds.borderRadius.xxxl,
      },
      optionRowPressed: {
        backgroundColor: theme.highlight,
      },
      optionSeparator: {
        height: ds.spacing.xs ?? 4,
      },
      optionLabel: {
        ...ds.typography.body,
        color: theme.text,
      },
      optionLabelActive: {
        fontWeight: '600',
        color: theme.primary,
      },
      optionLabelDestructive: {
        color: theme.accentOrange,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
