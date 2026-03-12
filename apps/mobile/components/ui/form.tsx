import React, {memo, useMemo} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {List, Surface, type ListItemProps} from 'react-native-paper';
import {Palette, themeKey, type DSShape, type ThemeShape} from '@/constants';
import {useTheme} from '@/providers';
import {
  useSafeRouter,
  makeStyleFactory,
  type IconProps,
  AppIcons,
  Icon,
} from '@/utils';
import type {Href} from 'expo-router';

/**
 * Provide **either** `href` (key is derived from the path) **or** an explicit
 * `rowKey` for non-navigable rows. At least one must be present.
 */
type KeyedRow =
  | {href: Href; rowKey?: string}
  | {href?: undefined; rowKey: string};

/**
 * Props for a single {@link ListRow}.
 */
export type ListRowProps = Readonly<{
  title: React.ReactNode;
  description?: React.ReactNode;
  onPress?: () => void;
  a11yLabel: string;
  a11yHint: string;
  left?: ListItemProps['left'];
  right?: ListItemProps['right'];
  descriptionNumberOfLines?: number;
  descriptionEllipsizeMode?: ListItemProps['descriptionEllipsizeMode'];
  style?: StyleProp<ViewStyle>;
}> &
  KeyedRow;

/**
 * Props for {@link ListRows}.
 *
 * Pass either a `rows` data array or `children` — never both.
 */
type ListRowsProps = Readonly<{
  style?: StyleProp<ViewStyle>;
  gapHeight?: number;
}> &
  (
    | {rows: readonly ListRowProps[]; children?: never}
    | {children: React.ReactNode; rows?: never}
  );

/**
 * Convenience helper that creates a `right` render-prop for `List.Item`
 *
 * @example
 * ```tsx
 * <ListRow right={listIcon('chevron-right')} … />
 * ```
 */
type ListIconProps = Parameters<NonNullable<ListItemProps['right']>>[0];

export const listIcon = (
  icon: IconProps['name'],
  size?: IconProps['size'],
  color?: IconProps['color'],
): NonNullable<ListItemProps['right']> => {
  function ListIconRenderer(props: ListIconProps) {
    return (
      <Icon
        name={icon}
        size={size}
        color={color ?? props.color}
        style={props.style}
      />
    );
  }

  return ListIconRenderer;
};

const chevronRight = listIcon(AppIcons.actions.forward, 20, Palette.gray[500]);

/**
 * Themed list item with automatic navigation behaviour.
 *
 * - Supplying `href` auto-adds a chevron icon and push-navigation handler.
 * - `onPress` takes precedence over `href` when both are supplied.
 * - Both `right` and `onPress` can be overridden explicitly.
 */
export const ListRow = memo((p: ListRowProps) => {
  const router = useSafeRouter();
  const {ds, theme} = useTheme();

  const handlePress = useMemo(() => {
    if (p.onPress) return p.onPress;
    if (p.href) return () => router.push(p.href);
    return undefined;
  }, [router, p.href, p.onPress]);

  const renderRight = useMemo<ListItemProps['right']>(() => {
    if (p.right) return p.right;
    if (p.href) return chevronRight;
    return undefined;
  }, [p.right, p.href]);

  return (
    <List.Item
      title={p.title}
      description={p.description}
      left={p.left}
      right={renderRight}
      onPress={handlePress}
      unstable_pressDelay={60}
      accessibilityRole={handlePress ? 'button' : undefined}
      accessibilityLabel={p.a11yLabel}
      accessibilityHint={p.a11yHint}
      descriptionNumberOfLines={p.descriptionNumberOfLines}
      descriptionEllipsizeMode={p.descriptionEllipsizeMode}
      background={{foreground: true, borderless: false, color: theme.ripple}}
      style={[
        {borderRadius: ds.borderRadius.xs, backgroundColor: theme.card},
        p.style,
      ]}
      descriptionStyle={{color: theme.muted}}
    />
  );
});

ListRow.displayName = 'ListRow';

/**
 * Grouped row container that wraps items in a surface.
 *
 * - Pass a `rows` array for data-driven usage, or `children` for composition.
 * - Rows are visually separated by a transparent gap (default 2 px).
 */
export function ListRows(props: ListRowsProps): React.ReactElement {
  const {ds, theme} = useTheme();
  const stylesLocal = createStyles(ds, theme);

  const gapH: number = props.gapHeight ?? 2;

  const content = Array.isArray(props.rows)
    ? props.rows.map((r: ListRowProps) => (
        <ListRow key={r.rowKey ?? String(r.href)} {...r} />
      ))
    : props.children;

  const kids = React.Children.toArray(content).filter(Boolean);

  return (
    <Surface mode="flat" style={[stylesLocal.surface, props.style]}>
      {kids.map((child, idx) => (
        <React.Fragment
          key={
            React.isValidElement(child) && child.key != null
              ? String(child.key)
              : String(idx)
          }
        >
          {child}
          {idx !== kids.length - 1 && (
            <View style={[stylesLocal.gap, {height: gapH}]} />
          )}
        </React.Fragment>
      ))}
    </Surface>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) => ({
    gap: {backgroundColor: 'transparent'},
    surface: {
      borderRadius: ds.borderRadius.xxxl,
      overflow: 'hidden',
      backgroundColor: 'transparent',
    } as ViewStyle,
  }),
  (ds, theme) => themeKey(theme, ds),
);
