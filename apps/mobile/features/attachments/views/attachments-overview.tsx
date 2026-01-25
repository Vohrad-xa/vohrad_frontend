import {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {List, Chip, Surface} from 'react-native-paper';
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
  icon: (typeof AppIcons.files)[keyof typeof AppIcons.files];
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
  tileOrder?: AttachmentKind[];
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
        icon: AppIcons.files.image,
        onPress: onTilePress?.image,
      },
      {
        kind: 'document' as const,
        label: 'Documents',
        count: counts.document,
        icon: AppIcons.files.document,
        onPress: onTilePress?.document,
      },
      {
        kind: 'archive' as const,
        label: 'Archives',
        count: counts.archive,
        icon: AppIcons.files.archive,
        onPress: onTilePress?.archive,
      },
      {
        kind: 'other' as const,
        label: 'Other',
        count: counts.other,
        icon: AppIcons.files.others,
        onPress: onTilePress?.other,
      },
    ],
    [counts, onTilePress],
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {filterChip ? (
        <View style={styles.headerContainer}>
          <Chip
            onPress={filterChip.onClear}
            onClose={filterChip.onClear}
            accessibilityLabel={filterChip.accessibilityLabel ?? 'Clear filter'}
            style={styles.filterChip}
            mode="flat"
            elevation={1}
          >
            {filterChip.label}
          </Chip>
        </View>
      ) : (
        <ThemedText
          fontWeight="bold"
          colorToken="muted"
          style={styles.headerText}
        >
          All Attachments
        </ThemedText>
      )}

      <Surface elevation={1} mode="flat" style={styles.surface}>
        {tiles.map((tile) => (
          <List.Item
            key={tile.kind}
            title={tile.label}
            style={styles.listItem}
            description={
              tile.count > 0
                ? `${tile.count} ${tile.count === 1 ? 'file' : 'files'}`
                : 'None'
            }
            left={() => (
              <Icon name={tile.icon} size="xl" style={styles.leftSlot} />
            )}
            right={() => (
              <Icon
                name={AppIcons.actions.forward}
                size="lg"
                colorToken="muted"
                style={styles.rightSlot}
              />
            )}
            onPress={tile.onPress}
            rippleColor={theme.ripple}
            borderless
          />
        ))}
      </Surface>
    </ScrollView>
  );
}

const useStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
        padding: ds.spacing.md,
      },

      headerContainer: {
        paddingBottom: ds.spacing.md,
      },

      headerText: {
        marginHorizontal: ds.spacing.md,
        paddingBottom: ds.spacing.md,
      },

      filterChip: {
        alignSelf: 'flex-start',
        borderRadius: ds.borderRadius.full,
      },

      listItem: {
        paddingRight: 0,
        paddingTop: ds.spacing.xs,
        paddingBottom: ds.spacing.xs,
      },

      leftSlot: {
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: ds.spacing.md,
      },

      rightSlot: {
        justifyContent: 'center',
        alignItems: 'center',
        width: ds.iconSize.lg + ds.spacing.md,
      },

      surface: {
        borderRadius: ds.borderRadius.xxxl,
        overflow: 'hidden',
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
