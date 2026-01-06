import {useMemo} from 'react';
import {Palette} from '@/constants';
import {useTheme} from '@/providers';
import {Icon, AppIcons, type IconName} from '@/utils';
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
  glassEffect,
  frame,
  GlassEffectContainer,
  opacity,
} from 'sykamore-ui/ios';
import type {AttachmentKindCount} from '../utils/attachment-counts';
import type {AttachmentKind} from '@sykamore/types';
import type {SFSymbol} from 'sf-symbols-typescript';

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
    <GlassEffectContainer
      modifiers={[
        padding({
          vertical: ds.spacing.lg,
          leading: ds.spacing.lg,
          trailing: ds.spacing.sm,
        }),
        frame({
          alignment: 'center',
          minWidth: ds.screen.width - ds.spacing.lg * 2,
          maxHeight: 45,
          idealHeight: 45,
        }),
        glassEffect({
          glass: {
            variant: 'regular',
            interactive: true,
            tint: theme.accentBlue,
          },
          shape: 'roundedRectangle',
          cornerRadius: ds.borderRadius.full,
        }),
        foregroundStyle(Palette.white),
        opacity(0.9),
      ]}
    >
      <HStack alignment="center">
        <Text>{filterChip.label}</Text>
        <Spacer />
        <Button
          onPress={filterChip.onClear}
          label="clear filter"
          modifiers={[
            buttonStyle('glass'),
            font({
              size: ds.typography.ios.callout.baseSize,
              weight: 'medium',
            }),
            accessibilityLabel(filterChip.accessibilityLabel ?? 'Clear filter'),
          ]}
        />
      </HStack>
    </GlassEffectContainer>
  ) : undefined;

  return (
    <Host style={{flex: 1}} matchContents>
      <IOSList
        listStyle="automatic"
        scrollEnabled
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
                    systemImage={tile.systemImage as SFSymbol}
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
                    noContainer
                    useSwiftUI
                    colorToken="muted"
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
