import React, {useMemo} from 'react';
import {
  Host,
  List,
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
import {Palette} from '@/constants';
import {useTheme} from '@/providers';
import {Icon, AppIcons, type IconName, useSafeRouter} from '@/utils';
import type {AttachmentKindCount} from '../utils/attachment-counts';
import type {Href} from 'expo-router';

type AttachmentKindTile = Readonly<{
  kind: string;
  label: string;
  systemImage: IconName;
  count: number;
  href: Href;
}>;

type AttachmentFilterChip = Readonly<{
  label: string;
  onClear: () => void;
  accessibilityLabel?: string;
}>;

type AttachmentsOverviewProps = Readonly<{
  counts: AttachmentKindCount;
  filterChip?: AttachmentFilterChip;
}>;

function ChevronRight() {
  return (
    <Icon
      useSwiftUI
      name={AppIcons.actions.forward}
      colorToken="muted"
      fontWeight="medium"
      size={12}
    />
  );
}

const AttachmentTileRow = React.memo(
  ({label, systemImage, count, href}: AttachmentKindTile) => {
    const {ds, theme} = useTheme();
    const router = useSafeRouter();

    const countText = useMemo(() => {
      if (count <= 0) return 'none';
      return `${count} ${count === 1 ? 'item' : 'items'}`;
    }, [count]);

    const a11y = useMemo(() => `${label}, ${countText}`, [label, countText]);

    return (
      <Button
        onPress={() => router.push(href)}
        modifiers={[buttonStyle({style: 'plain'}), accessibilityLabel(a11y)]}
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
              font({textStyle: 'footnote'}),
              foregroundStyle('secondary'),
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
  filterChip,
}: AttachmentsOverviewProps) {
  const tiles = useMemo<readonly AttachmentKindTile[]>(
    () => [
      {
        kind: 'image',
        label: 'Images',
        count: counts.image,
        systemImage: AppIcons.files.image,
        href: '/(tabs)/vault/images' satisfies Href,
      },
      {
        kind: 'document',
        label: 'Documents',
        count: counts.document,
        systemImage: AppIcons.files.document,
        href: '/(tabs)/vault/documents' satisfies Href,
      },
      {
        kind: 'archive',
        label: 'Archives',
        count: counts.archive,
        systemImage: AppIcons.files.archive,
        href: '/(tabs)/vault/archives' satisfies Href,
      },
      {
        kind: 'other',
        label: 'Other',
        count: counts.other,
        systemImage: AppIcons.files.others,
        href: '/(tabs)/vault/other' satisfies Href,
      },
    ],
    [counts],
  );

  const filterHeader = filterChip ? (
    <HStack alignment="center">
      <Text>{filterChip.label}</Text>
      <Spacer />
      <Button
        onPress={filterChip.onClear}
        systemImage="x.circle"
        label="Clear filter"
        modifiers={[
          buttonStyle({
            style: 'automatic',
          }),
          tint(Palette.blue),
          controlSize('small'),
          accessibilityLabel(filterChip.accessibilityLabel ?? 'Clear filter'),
        ]}
      />
    </HStack>
  ) : undefined;

  return (
    <Host style={{flex: 1}}>
      <List listStyle="automatic">
        <Section
          header={filterHeader}
          title={filterChip ? undefined : 'All Attachments'}
        >
          {tiles.map((tile) => (
            <AttachmentTileRow key={tile.kind} {...tile} />
          ))}
        </Section>
      </List>
    </Host>
  );
}

AttachmentTileRow.displayName = 'AttachmentTileRow';
