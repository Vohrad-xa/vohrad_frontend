import React, {useMemo} from 'react';
import {StyleSheet} from 'react-native';
import {ModalScrollView} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants';
import type {AttachmentKindCount} from '@/features/attachments/utils/attachment-counts';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils';
import {AttachmentKindGrid, type AttachmentKindTile} from '../components';

type AttachmentKindKey = AttachmentKindTile['kind'];

interface AttachmentsOverviewProps {
  counts: AttachmentKindCount;
  onTilePress?: Partial<Record<AttachmentKindKey, () => void>>;
}

export function AttachmentsOverview({
  counts,
  onTilePress,
}: AttachmentsOverviewProps) {
  const {ds, theme} = useTheme();
  const styles = useStyles(ds, theme);

  const tiles = useMemo<AttachmentKindTile[]>(
    () => [
      {
        kind: 'image' as const,
        label: 'Images',
        count: counts.image,
        onPress: onTilePress?.image,
      },
      {
        kind: 'document' as const,
        label: 'Documents',
        count: counts.document,
        onPress: onTilePress?.document,
      },
      {
        kind: 'video' as const,
        label: 'Videos',
        count: counts.video,
        onPress: onTilePress?.video,
      },
      {
        kind: 'archive' as const,
        label: 'Archives',
        count: counts.archive,
        onPress: onTilePress?.archive,
      },
      {
        kind: 'other' as const,
        label: 'Other',
        count: counts.other,
        onPress: onTilePress?.other,
      },
    ],
    [counts, onTilePress],
  );

  return (
    <ModalScrollView contentContainerStyle={styles.scrollContent}>
      <AttachmentKindGrid tiles={tiles} />
    </ModalScrollView>
  );
}

const useStyles = makeStyleFactory(
  (_ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      scrollContent: {},
    }),
  (ds, theme) => themeKey(theme, ds),
);
