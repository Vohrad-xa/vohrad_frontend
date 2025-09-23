import React, {useMemo} from 'react';
import {View, StyleSheet, TouchableOpacity, FlatList, Platform} from 'react-native';
import {usePlatformStyles} from '@/hooks';
import {useTheme} from '@/providers';
import type {MenuItem} from '@/types';
import {Icon, AppIcons} from '@/utils';
import {ThemedText} from './themed-text';

export function InfoCard() {
  const {ds, theme} = useTheme();

  const quickActions: MenuItem[] = useMemo(
    () => [
      {label: 'Add', icon: AppIcons.actions.add},
      {label: 'Move', icon: AppIcons.actions.move},
      {label: 'Scan', icon: AppIcons.actions.scan},
      {label: 'Maintain', icon: AppIcons.business.maintenance},
      {label: 'Print', icon: AppIcons.content.print},
      {label: 'Categories', icon: AppIcons.inventory.categories},
      {label: 'Suppliers', icon: AppIcons.business.suppliers},
      {label: 'Events', icon: AppIcons.business.events},
      {label: 'Documents', icon: AppIcons.content.document},
      {label: 'Locations', icon: AppIcons.inventory.locations},
      {label: 'Items', icon: AppIcons.inventory.items},
    ],
    [],
  );

  const renderAction = ({item}: {item: MenuItem}) => (
    <TouchableOpacity style={styles.actionButton}>
      <View style={styles.iconContainer}>
        <Icon name={item.icon} size={ds.iconSize.xxl} colorToken="quickActionIcon" />
      </View>
      <ThemedText style={styles.actionLabel}>{item.label}</ThemedText>
    </TouchableOpacity>
  );

  // Platform-specific container styles
  const containerStyles = usePlatformStyles({
    web: {
      marginLeft: -ds.layout.screenPadding,
      marginRight: -ds.layout.screenPadding,
      paddingLeft: ds.layout.screenPadding,
      paddingRight: ds.layout.screenPadding,
    },
    mobile: {
      marginHorizontal: -ds.layout.screenPadding,
    },
  });

  // Platform-specific content styles
  const contentStyles = usePlatformStyles({
    web: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(79px, 1fr))',
      gap: ds.spacing.xs,
      overflow: 'auto',
    },
    mobile: {
      // Mobile uses FlatList, no styles needed
    },
  });

  const styles = createStyles(containerStyles, contentStyles, theme, ds);

  return (
    <View style={styles.card}>
      {Platform.OS === 'web' ? (
        <View style={styles.webGrid}>
          {quickActions.map((item) => (
            <TouchableOpacity key={item.label} style={styles.actionButton}>
              <View style={styles.iconContainer}>
                <Icon name={item.icon} size={ds.iconSize.xxl} colorToken="quickActionIcon" />
              </View>
              <ThemedText style={styles.actionLabel}>{item.label}</ThemedText>
            </TouchableOpacity>
          ))}
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

const createStyles = (
  containerStyles: ReturnType<typeof usePlatformStyles>,
  contentStyles: ReturnType<typeof usePlatformStyles>,
  theme: ReturnType<typeof useTheme>['theme'],
  ds: ReturnType<typeof useTheme>['ds'],
) =>
  StyleSheet.create({
    card: containerStyles,
    webGrid: contentStyles,
    actionButton: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: ds.spacing.md,
      gap: ds.spacing.xs,
      minWidth: 79,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: ds.borderRadius.full,
      backgroundColor: theme.quickActionIconBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionLabel: {
      ...ds.typography.footnote,
      textAlign: 'center',
      color: theme.muted,
      fontWeight: '600',
    },
  });
