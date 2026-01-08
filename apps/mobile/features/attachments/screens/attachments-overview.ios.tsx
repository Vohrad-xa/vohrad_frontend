import {useMemo} from 'react';
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

interface AttachmentKindTile {
  kind: AttachmentKind;
  label: string;
  count: number;
  onPress?: () => void;
  systemImage: IconName;
}

type AttachmentKindKey = AttachmentKindTile['kind'];

interface AttachmentFilterChip {
  label: string;
  onClear: () => void;
  accessibilityLabel?: string;
}

interface AttachmentsOverviewProps {
  counts: AttachmentKindCount;
  onTilePress?: Partial<Record<AttachmentKindKey, () => void>>;
  filterChip?: AttachmentFilterChip;
  tileOrder?: AttachmentKindKey[];
  onMoveTile?: (from: number, to: number) => void;
}

export function AttachmentsOverview({
  counts,
  onTilePress,
  filterChip,
  tileOrder,
  onMoveTile,
}: AttachmentsOverviewProps) {
  const {ds, theme} = useTheme();

  const tiles = useMemo<AttachmentKindTile[]>(
    () => [
      {
        kind: 'image' as const,
        label: 'Images',
        count: counts.image,
        onPress: onTilePress?.image,
        systemImage: AppIcons.files.image,
      },
      {
        kind: 'document' as const,
        label: 'Documents',
        count: counts.document,
        onPress: onTilePress?.document,
        systemImage: AppIcons.files.document,
      },
      {
        kind: 'archive' as const,
        label: 'Archives',
        count: counts.archive,
        onPress: onTilePress?.archive,
        systemImage: AppIcons.files.archive,
      },
      {
        kind: 'other' as const,
        label: 'Other',
        count: counts.other,
        onPress: onTilePress?.other,
        systemImage: AppIcons.files.others,
      },
    ],
    [counts, onTilePress],
  );

  const orderedTiles = useMemo(() => {
    if (!tileOrder || tileOrder.length === 0) {
      return tiles;
    }

    const tileMap = new Map<AttachmentKindKey, AttachmentKindTile>(
      tiles.map((tile) => [tile.kind, tile]),
    );
    const seen = new Set<AttachmentKindKey>();
    const ordered: AttachmentKindTile[] = [];

    tileOrder.forEach((kind) => {
      const tile = tileMap.get(kind);
      if (!tile || seen.has(kind)) {
        return;
      }
      ordered.push(tile);
      seen.add(kind);
    });

    tiles.forEach((tile) => {
      if (!seen.has(tile.kind)) {
        ordered.push(tile);
      }
    });

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
          {orderedTiles.map((tile) => {
            const countText =
              tile.count > 0
                ? `${tile.count} ${tile.count === 1 ? 'file' : 'files'}`
                : 'none';

            return (
              <Button onPress={tile.onPress} key={tile.kind}>
                <HStack key={tile.kind}>
                  <Label
                    modifiers={[tint(theme.text)]}
                    title={tile.label}
                    systemImage={tile.systemImage}
                  />
                  <Spacer />

                  <Text
                    monospaced
                    modifiers={[
                      font({
                        size: ds.typography.ios.caption.baseSize,
                      }),
                      foregroundStyle(theme.muted),
                      padding({horizontal: ds.spacing.md}),
                    ]}
                  >
                    {countText}
                  </Text>

                  <Icon
                    name={AppIcons.ui.chevronRight}
                    colorToken="muted"
                    useSwiftUI
                    fontWeight="semibold"
                    size={13}
                  />
                </HStack>
              </Button>
            );
          })}
        </Section>
      </IOSList>
    </Host>
  );
}
