import React, {useMemo} from 'react';
import {StyleSheet, View, ScrollView} from 'react-native';
import {Chip, List} from 'react-native-paper';
import {
  ThemedText,
  ListRows,
  listIcon,
  type ListRowProps,
} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants';
import {useTheme} from '@/providers';
import {makeStyleFactory, AppIcons} from '@/utils';
import type {AttachmentKindCount} from '../utils/attachment-counts';
import type {Href} from 'expo-router';

const leftImage = listIcon(AppIcons.files.image);
const leftDocument = listIcon(AppIcons.files.document);
const leftArchive = listIcon(AppIcons.files.archive);
const leftOther = listIcon(AppIcons.files.others);

function formatCount(count: number): string {
  if (count === 0) return 'None';
  return `${count} ${count === 1 ? 'item' : 'items'}`;
}

interface AttachmentFilterChip {
  label: string;
  onClear: () => void;
  accessibilityLabel?: string;
}

interface AttachmentsOverviewProps {
  counts: AttachmentKindCount;
  filterChip?: AttachmentFilterChip;
}

export function AttachmentsOverview({
  counts,
  filterChip,
}: AttachmentsOverviewProps) {
  const {ds, theme} = useTheme();
  const styles = useStyles(ds, theme);

  const tiles = useMemo<ListRowProps[]>(
    () => [
      {
        href: '/(tabs)/vault/images' satisfies Href,
        title: 'Images',
        description: formatCount(counts.image),
        left: leftImage,
        a11yLabel: 'Images',
        a11yHint: 'View image attachments',
      },
      {
        href: '/(tabs)/vault/documents' satisfies Href,
        title: 'Documents',
        description: formatCount(counts.document),
        left: leftDocument,
        a11yLabel: 'Documents',
        a11yHint: 'View document attachments',
      },
      {
        href: '/(tabs)/vault/archives' satisfies Href,
        title: 'Archives',
        description: formatCount(counts.archive),
        left: leftArchive,
        a11yLabel: 'Archives',
        a11yHint: 'View archive attachments',
      },
      {
        href: '/(tabs)/vault/other' satisfies Href,
        title: 'Other',
        description: formatCount(counts.other),
        left: leftOther,
        a11yLabel: 'Other',
        a11yHint: 'View other attachments',
      },
    ],
    [counts],
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

      <List.Section>
        <ListRows rows={tiles} />
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
    }),
  (ds, theme) => themeKey(theme, ds),
);
