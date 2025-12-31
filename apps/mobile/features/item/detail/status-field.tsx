import React from 'react';
import {StyleSheet, View} from 'react-native';
import {ThemedText} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants';
import {useTheme} from '@/providers';
import {makeStyleFactory, Icon, AppIcons, type IconName} from '@/utils';
import type {Status} from '@sykamore/types';

interface StatusFieldProps {
  status?: Status | null;
}

const STATUS_ICON_BY_KEY = {
  success: AppIcons.status.success,
  warning: AppIcons.status.warning,
  error: AppIcons.status.error,
  info: AppIcons.status.info,
  help: AppIcons.status.help,
  time: AppIcons.status.time,
} as const;

const STATUS_ICON_VALUES = new Set(Object.values(STATUS_ICON_BY_KEY));

const resolveStatusIcon = (icon?: string | null): IconName => {
  if (!icon) return AppIcons.status.info;

  const byKey = STATUS_ICON_BY_KEY[icon as keyof typeof STATUS_ICON_BY_KEY];
  if (byKey) return byKey;

  if (
    STATUS_ICON_VALUES.has(
      icon as (typeof STATUS_ICON_BY_KEY)[keyof typeof STATUS_ICON_BY_KEY],
    )
  ) {
    return icon as IconName;
  }

  return AppIcons.status.info;
};

const StatusFieldComponent = ({status}: StatusFieldProps) => {
  const {ds, theme: _theme} = useTheme();
  const styles = createStyles(ds, _theme);

  const statusIcon = status?.icon ? resolveStatusIcon(status.icon) : null;

  return (
    <View style={styles.fieldRow}>
      <ThemedText variant="label" style={styles.fieldLabel}>
        status
      </ThemedText>

      <View style={styles.statusContainer}>
        <ThemedText variant="value">{status?.name ?? 'None'}</ThemedText>

        {statusIcon && (
          <Icon
            name={statusIcon}
            size="md"
            style={[styles.statusIcon, {color: status?.color ?? _theme.muted}]}
          />
        )}
      </View>
    </View>
  );
};

StatusFieldComponent.displayName = 'StatusField';
export const ItemStatusField = React.memo(StatusFieldComponent);

const createStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      fieldRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
      },
      fieldLabel: {
        flex: 1,
      },
      statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: ds.spacing.md,
      },
      statusIcon: {
        marginLeft: 4,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
