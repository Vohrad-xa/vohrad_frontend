import {memo, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {List, Chip, Surface} from 'react-native-paper';
import {ThemedText} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants';
import {useTheme} from '@/providers';
import {makeStyleFactory, AppIcons, type IconName} from '@/utils';
import type {AttachmentKindCount} from '../utils/attachment-counts';
import type {AttachmentKind} from '@sykamore/types';

interface AttachmentTileModel {
  kind: AttachmentKind;
  label: string;
  count: number;
  icon: IconName;
  onPress?: () => void;
}

type AttachmentKindKey = AttachmentTileModel['kind'];

const AttachmentTile = memo(
  ({label, count, icon, onPress}: AttachmentTileModel) => {
    const description =
      count > 0 ? `${count} ${count === 1 ? 'file' : 'files'}` : 'None';

    return (
      <List.Item
        title={label}
        description={description}
        left={(props) => <List.Icon {...props} icon={icon} />}
        right={(props) => (
          <List.Icon {...props} icon={AppIcons.actions.forward} />
        )}
        onPress={onPress}
        borderless
      />
    );
  },
);

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

  const tiles = useMemo<AttachmentTileModel[]>(
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
        <ThemedText variant="title2" style={styles.headerText}>
          All Attachments
        </ThemedText>
      )}

      <List.Section style={{gap: ds.spacing.xxs}}>
        <Surface mode="flat" style={styles.surfaceTop}>
          <AttachmentTile {...tiles[0]} />
        </Surface>

        <Surface mode="flat">
          <AttachmentTile {...tiles[1]} />
        </Surface>

        <Surface mode="flat">
          <AttachmentTile {...tiles[2]} />
        </Surface>

        <Surface mode="flat" style={styles.surfaceBottom}>
          <AttachmentTile {...tiles[3]} />
        </Surface>
      </List.Section>
    </ScrollView>
  );
}

const useStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
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
        color: theme.muted,
      },

      filterChip: {
        alignSelf: 'flex-start',
        borderRadius: ds.borderRadius.full,
      },

      surfaceTop: {
        borderTopLeftRadius: ds.borderRadius.xxxl,
        borderTopRightRadius: ds.borderRadius.xxxl,
        overflow: 'hidden',
      },

      surfaceBottom: {
        borderBottomLeftRadius: ds.borderRadius.xxxl,
        borderBottomRightRadius: ds.borderRadius.xxxl,
        overflow: 'hidden',
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);

AttachmentTile.displayName = 'AttachmentTile';
