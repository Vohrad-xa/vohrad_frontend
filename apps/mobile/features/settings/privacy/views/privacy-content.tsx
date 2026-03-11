import React, {useMemo} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Avatar, List} from 'react-native-paper';
import {
  ListRows,
  ThemedText,
  rightIcon,
  type ListRowProps,
} from '@/components/ui';
import {Palette, themeKey, type DSShape, type ThemeShape} from '@/constants';
import {useTheme} from '@/providers';
import {AppIcons, makeStyleFactory} from '@/utils';
import {
  PRIVACY_ACCOUNT_ROWS,
  PRIVACY_HEADER,
  PRIVACY_LEGAL_ROWS,
  PRIVACY_SECURITY_ROWS,
  type PrivacyRow,
} from '../constants';

const noop = () => {};

function mapRows(rows: readonly PrivacyRow[]): ListRowProps[] {
  return rows.map((row) => {
    const common = {
      title: row.title,
      description: row.description,
      a11yLabel: row.a11yLabel ?? row.title,
      a11yHint: row.a11yHint ?? `Open ${row.title}`,
    } as const;

    if (row.href) {
      return {
        ...common,
        href: row.href,
      } satisfies ListRowProps;
    }

    return {
      ...common,
      rowKey: row.rowKey,
      onPress: noop,
      right: rightIcon(AppIcons.actions.forward),
    } satisfies ListRowProps;
  });
}

export function PrivacyContent() {
  const {ds, theme} = useTheme();
  const styles = useStyles(ds, theme);
  const securityRows = useMemo(() => mapRows(PRIVACY_SECURITY_ROWS), []);
  const accountRows = useMemo(() => mapRows(PRIVACY_ACCOUNT_ROWS), []);
  const legalRows = useMemo(() => mapRows(PRIVACY_LEGAL_ROWS), []);

  return (
    <ScrollView
      style={styles.container}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Avatar.Icon
          size={80}
          icon={AppIcons.ui.privacy}
          color={Palette.deepblue}
          style={styles.headerIcon}
          accessibilityLabel="Privacy"
        />
        <ThemedText variant="title1" style={styles.headerTitle}>
          {PRIVACY_HEADER.title}
        </ThemedText>
        <ThemedText
          variant="footnote"
          colorToken="muted"
          style={styles.headerDescription}
        >
          {PRIVACY_HEADER.description}
        </ThemedText>
      </View>

      <List.Section>
        <ListRows rows={securityRows} />
      </List.Section>

      <List.Section>
        <ListRows rows={accountRows} />
      </List.Section>

      <List.Section>
        <ListRows rows={legalRows} />
      </List.Section>
    </ScrollView>
  );
}

const useStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
      },
      content: {
        padding: ds.layout.screenPadding,
      },
      header: {
        alignItems: 'center',
        paddingHorizontal: ds.spacing.xl,
        paddingVertical: ds.spacing.sm,
      },
      headerIcon: {
        width: 85,
        height: 85,
      },
      headerTitle: {
        marginTop: ds.spacing.md,
        textAlign: 'center',
      },
      headerDescription: {
        marginTop: ds.spacing.sm,
        textAlign: 'center',
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
