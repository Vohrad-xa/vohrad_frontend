import React from 'react';
import {StyleSheet, View} from 'react-native';
import {ThemedText} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory, Icon, type IconName} from '@/utils';
import type {Status} from '@vohrad/types';

interface StatusFieldProps {
  status?: Status | null;
}

const StatusFieldComponent = ({status}: StatusFieldProps) => {
  const {ds, theme: _theme} = useTheme();
  const styles = createStyles(ds, _theme);

  return (
    <View style={styles.fieldRow}>
      <ThemedText variant="label" style={styles.fieldLabel}>
        status
      </ThemedText>
      <View style={styles.statusContainer}>
        <ThemedText variant="value">{status?.name ?? 'None'}</ThemedText>
        {status?.icon && (
          <Icon
            name={status.icon as IconName}
            size="md"
            style={[styles.statusIcon, {color: status.color}]}
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
