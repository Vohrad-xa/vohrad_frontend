import React, {memo, useMemo} from 'react';
import {StyleSheet, View, ScrollView} from 'react-native';
import {List, Chip, Surface, Divider} from 'react-native-paper';
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

    const {ds, theme} = useTheme();

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
        style={{
          borderRadius: ds.borderRadius.sm,
          backgroundColor: theme.card,
        }}
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

      <List.Section style={styles.section}>
        {tiles.map((t, idx) => (
          <React.Fragment key={t.kind}>
            <AttachmentTile {...t} />
            {idx !== tiles.length - 1 && <Divider style={styles.divider} />}
          </React.Fragment>
        ))}
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

      section: {
        borderRadius: ds.borderRadius.xxxl,
        overflow: 'hidden',
      },

      divider: {
        height: 1.9,
        backgroundColor: 'transparent',
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);

AttachmentTile.displayName = 'AttachmentTile';
