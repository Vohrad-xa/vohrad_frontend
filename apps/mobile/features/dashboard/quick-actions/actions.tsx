import React, {useMemo, useRef} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import {ThemedText} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import type {MenuItem} from '@/types';
import {Icon, AppIcons} from '@/utils';
import {makeStyleFactory} from '@/utils/style-factory';
import {AddQuickAction} from './add/add';
import {ScanQuickAction} from './scan-action';

type QuickActionsProps = {
  onScanPress?: () => void;
};

export function QuickActions({onScanPress}: QuickActionsProps) {
  const {ds, theme} = useTheme();
  const containerRef = useRef<View>(null);

  const quickActions: MenuItem[] = useMemo(
    () => [
      {label: 'Add', icon: AppIcons.actions.add},
      {label: 'Move', icon: AppIcons.actions.move},
      {label: 'Scan', icon: AppIcons.actions.scan},
      {label: 'Maintain', icon: AppIcons.features.maintenance},
      {label: 'Print', icon: AppIcons.files.print},
      {label: 'Categories', icon: AppIcons.features.category},
      {label: 'Suppliers', icon: AppIcons.features.supplier},
      {label: 'Events', icon: AppIcons.tabs.notifications},
      {label: 'Documents', icon: AppIcons.files.document},
      {label: 'Locations', icon: AppIcons.features.location},
      {label: 'Items', icon: AppIcons.features.item},
    ],
    [],
  );

  const styles = createStyles(ds, theme);
  const addActionStyles = useMemo(
    () => ({
      actionButton: styles.actionButton,
      iconContainer: styles.iconContainer,
      actionLabel: styles.actionLabel,
    }),
    [styles.actionButton, styles.iconContainer, styles.actionLabel],
  );

  const renderAction = ({item}: {item: MenuItem}) => {
    if (item.label === 'Add') {
      return (
        <AddQuickAction
          icon={item.icon}
          label={item.label}
          containerRef={containerRef}
          actionStyles={addActionStyles}
        />
      );
    }

    if (item.label === 'Scan') {
      return (
        <ScanQuickAction
          icon={item.icon}
          label={item.label}
          actionStyles={addActionStyles}
          onScanPress={onScanPress}
        />
      );
    }

    return (
      <TouchableOpacity style={styles.actionButton}>
        <View style={styles.iconContainer}>
          <Icon
            name={item.icon}
            size={ds.iconSize.xxl}
            colorToken="quickActionIcon"
          />
        </View>
        <ThemedText variant="subheadline" style={styles.actionLabel}>
          {item.label}
        </ThemedText>
      </TouchableOpacity>
    );
  };

  return (
    <View ref={containerRef} collapsable={false} style={styles.card}>
      {Platform.OS === 'web' ? (
        <View style={styles.webGrid}>
          {quickActions.map((item) => {
            if (item.label === 'Add') {
              return (
                <AddQuickAction
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  containerRef={containerRef}
                  actionStyles={addActionStyles}
                />
              );
            }

            if (item.label === 'Scan') {
              return (
                <ScanQuickAction
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  actionStyles={addActionStyles}
                  onScanPress={onScanPress}
                />
              );
            }

            return (
              <TouchableOpacity key={item.label} style={styles.actionButton}>
                <View style={styles.iconContainer}>
                  <Icon
                    name={item.icon}
                    size={ds.iconSize.xxl}
                    colorToken="quickActionIcon"
                  />
                </View>
                <ThemedText style={styles.actionLabel}>{item.label}</ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <FlatList
          data={quickActions}
          renderItem={renderAction}
          keyExtractor={(item) => item.label}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) => {
    const containerStylesWeb = {
      marginLeft: -ds.layout.screenPadding as number | undefined,
      marginRight: -ds.layout.screenPadding as number | undefined,
      marginHorizontal: undefined as number | undefined,
    };
    const containerStylesMobile = {
      marginHorizontal: -ds.layout.screenPadding as number | undefined,
      marginLeft: undefined as number | undefined,
      marginRight: undefined as number | undefined,
    };

    const contentStylesWeb = {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(78.5px, 1fr))',
      gap: ds.spacing.md,
      overflow: 'auto',
    };

    return StyleSheet.create({
      card: Platform.select({
        web: containerStylesWeb,
        default: containerStylesMobile,
      }) as ViewStyle,
      webGrid: Platform.select({
        web: contentStylesWeb,
      }) as ViewStyle,
      actionButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Platform.OS === 'ios' ? ds.spacing.xs : ds.spacing.md,
        gap: ds.spacing.sm,
        minWidth: 78.5,
      } as ViewStyle,
      iconContainer: {
        width: 50,
        height: 50,
        borderRadius: ds.borderRadius.full,
        backgroundColor: theme.secondary,
        alignItems: 'center',
        justifyContent: 'center',
      } as ViewStyle,
      actionLabel: {
        textAlign: 'center',
        color: theme.muted,
        fontWeight: ds.fontWeight.semibold,
      } as TextStyle,
    });
  },
  (ds, theme) => themeKey(theme, ds),
);
