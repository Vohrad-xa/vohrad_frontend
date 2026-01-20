import {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {List, Divider, Chip} from 'react-native-paper';
import {ThemedText} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants';
import {useTheme} from '@/providers';
import {makeStyleFactory, Icon, AppIcons} from '@/utils';
import type {AttachmentKindCount} from '../utils/attachment-counts';
import type {AttachmentKind} from '@sykamore/types';

interface AttachmentKindTile {
  kind: AttachmentKind;
  label: string;
  count: number;
  onPress?: () => void;
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
    <ScrollView style={styles.container}>
      {filterChip && (
        <View style={styles.filterContainer}>
          <Chip
            onPress={filterChip.onClear}
            onClose={filterChip.onClear}
            accessibilityLabel={filterChip.accessibilityLabel ?? 'Clear filter'}
            style={styles.filterChip}
            mode="flat"
            elevation={2}
          >
            {filterChip.label}
          </Chip>
        </View>
      )}
      {tiles.map((tile, index) => (
        <View key={tile.kind}>
          <List.Item
            title={<ThemedText variant="body">{tile.label}</ThemedText>}
            description={
              tile.count > 0
                ? `${tile.count} ${tile.count === 1 ? 'file' : 'files'}`
                : undefined
            }
            left={() => <Icon name={AppIcons.files.folder} size="xxl" />}
            onPress={tile.onPress}
            descriptionStyle={styles.description}
          />
          {index < tiles.length - 1 && <Divider style={styles.divider} />}
        </View>
      ))}
    </ScrollView>
  );
}

const useStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
        paddingHorizontal: ds.spacing.lg,
      },
      description: {
        color: theme.muted,
      },
      filterContainer: {
        paddingVertical: ds.spacing.lg,
      },
      filterChip: {
        alignSelf: 'flex-start',
        borderRadius: ds.borderRadius.full,
      },
      divider: {
        marginLeft: ds.spacing.xxl + ds.spacing.xl,
        height: 1,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
