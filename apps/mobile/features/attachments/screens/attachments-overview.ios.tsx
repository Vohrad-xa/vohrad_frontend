import React, {useMemo, useCallback} from 'react';
import {
  Host,
  List as IOSList,
  Button,
  HStack,
  Label,
  Spacer,
  Text,
  accessibilityLabel,
  font,
  foregroundStyle,
  padding,
  tint,
  Section,
  buttonStyle,
  controlSize,
} from 'sykamore-ui';
import {useTheme} from '@/providers';
import {Icon, AppIcons, type IconName} from '@/utils';
import type {AttachmentKindCount} from '../utils/attachment-counts';
import type {AttachmentKind} from '@sykamore/types';

type AttachmentKindTile = Readonly<{
  kind: AttachmentKind;
  label: string;
  systemImage: IconName;
  count: number;
  onPress?: () => void;
}>;

type AttachmentKindKey = AttachmentKindTile['kind'];

type AttachmentFilterChip = Readonly<{
  label: string;
  onClear: () => void;
  accessibilityLabel?: string;
}>;

type AttachmentsOverviewProps = Readonly<{
  counts: AttachmentKindCount;
  onTilePress?: Partial<Record<AttachmentKindKey, () => void>>;
  filterChip?: AttachmentFilterChip;
  tileOrder?: AttachmentKindKey[];
  onMoveTile?: (from: number, to: number) => void;
}>;

function ChevronRight() {
  return (
    <Icon
      useSwiftUI
      name={AppIcons.ui.chevronRight}
      colorToken="muted"
      fontWeight="medium"
      size={12}
    />
  );
}

const AttachmentTileRow = React.memo(
  ({
    label,
    systemImage,
    count,
    onPress,
  }: Pick<
    AttachmentKindTile,
    'label' | 'systemImage' | 'count' | 'onPress'
  >) => {
    const {ds, theme} = useTheme();

    const countText = useMemo(() => {
      if (count <= 0) return 'none';
      return `${count} ${count === 1 ? 'file' : 'files'}`;
    }, [count]);

    const a11y = useMemo(() => `${label}, ${countText}`, [label, countText]);

    // Guard: if no onPress, make the row inert.
    const handlePress = useCallback(() => {
      onPress?.();
    }, [onPress]);

    return (
      <Button
        onPress={handlePress}
        modifiers={[
          buttonStyle('automatic'),
          tint('primary'),
          accessibilityLabel(a11y),
        ]}
      >
        <HStack alignment="center">
          <Label
            modifiers={[tint(theme.text)]}
            title={label}
            systemImage={systemImage}
          />
          <Spacer />

          <Text
            monospaced
            modifiers={[
              font({size: ds.typography.ios.caption.baseSize}),
              foregroundStyle(theme.muted),
              padding({horizontal: ds.spacing.md}),
            ]}
          >
            {countText}
          </Text>

          <ChevronRight />
        </HStack>
      </Button>
    );
  },
);

export function AttachmentsOverview({
  counts,
  onTilePress,
  filterChip,
  tileOrder,
  onMoveTile,
}: AttachmentsOverviewProps) {
  const tiles = useMemo<readonly AttachmentKindTile[]>(
    () => [
      {
        kind: 'image',
        label: 'Images',
        count: counts.image,
        onPress: onTilePress?.image,
        systemImage: AppIcons.files.image,
      },
      {
        kind: 'document',
        label: 'Documents',
        count: counts.document,
        onPress: onTilePress?.document,
        systemImage: AppIcons.files.document,
      },
      {
        kind: 'archive',
        label: 'Archives',
        count: counts.archive,
        onPress: onTilePress?.archive,
        systemImage: AppIcons.files.archive,
      },
      {
        kind: 'other',
        label: 'Other',
        count: counts.other,
        onPress: onTilePress?.other,
        systemImage: AppIcons.files.others,
      },
    ],
    [counts, onTilePress],
  );

  const orderedTiles = useMemo(() => {
    if (!tileOrder || tileOrder.length === 0) return tiles;

    const tileMap = new Map<AttachmentKindKey, AttachmentKindTile>(
      tiles.map((tile) => [tile.kind, tile]),
    );

    const seen = new Set<AttachmentKindKey>();
    const ordered: AttachmentKindTile[] = [];

    for (const kind of tileOrder) {
      const tile = tileMap.get(kind);
      if (!tile || seen.has(kind)) continue;
      ordered.push(tile);
      seen.add(kind);
    }

    for (const tile of tiles) {
      if (!seen.has(tile.kind)) ordered.push(tile);
    }

    return ordered;
  }, [tileOrder, tiles]);

  const filterHeader = filterChip ? (
    <HStack alignment="center">
      <Text>{filterChip.label}</Text>
      <Spacer />
      <Button
        onPress={filterChip.onClear}
        label="clear filter"
        systemImage="x.circle"
        modifiers={[
          buttonStyle('automatic'),
          controlSize('small'),
          accessibilityLabel(filterChip.accessibilityLabel ?? 'Clear filter'),
        ]}
      />
    </HStack>
  ) : undefined;

  return (
    <Host style={{flex: 1}}>
      <IOSList
        listStyle="automatic"
        refreshEnabled
        moveEnabled={Boolean(onMoveTile)}
        onMoveItem={onMoveTile}
      >
        <Section header={filterHeader} title="All Attachments">
          {orderedTiles.map((tile) => (
            <AttachmentTileRow
              key={tile.kind}
              label={tile.label}
              systemImage={tile.systemImage}
              count={tile.count}
              onPress={tile.onPress}
            />
          ))}
        </Section>
      </IOSList>
    </Host>
  );
}

AttachmentTileRow.displayName = 'AttachmentTileRow';
