import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {ModalScrollView} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils';
import {AttachmentKindGrid} from '../components/attachment-kind-grid';
import type {AttachmentKindTile} from '../components/attachment-kind-grid';

export interface AttachmentKindCount {
  image: number;
  document: number;
  video: number;
  archive: number;
  other: number;
}

interface AttachmentsOverviewProps {
  counts: AttachmentKindCount;
}

export function AttachmentsOverview({counts}: AttachmentsOverviewProps) {
  const {ds, theme} = useTheme();
  const styles = useStyles(ds, theme);

  const tiles = useMemo<AttachmentKindTile[]>(
    () => [
      {
        kind: 'image' as const,
        label: 'Images',
        count: counts.image,
      },
      {
        kind: 'document' as const,
        label: 'Documents',
        count: counts.document,
      },
      {
        kind: 'video' as const,
        label: 'Videos',
        count: counts.video,
      },
      {
        kind: 'archive' as const,
        label: 'Archives',
        count: counts.archive,
      },
      {
        kind: 'other' as const,
        label: 'Other',
        count: counts.other,
      },
    ],
    [counts],
  );

  return (
    <ModalScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.gridContainer}>
        <AttachmentKindGrid tiles={tiles} />
      </View>
    </ModalScrollView>
  );
}

const useStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      scrollContent: {
        paddingTop: 0,
      },
      gridContainer: {
        marginHorizontal: -ds.spacing.xxl,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
