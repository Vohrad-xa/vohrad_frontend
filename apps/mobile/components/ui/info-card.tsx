import React from 'react';
import {View, StyleSheet, TouchableOpacity, FlatList} from 'react-native';
import {useTheme} from '@/providers';
import {Icon, type IconName, AppIcons} from '@/utils';
import {ThemedText} from './themed-text';

interface QuickAction {
  name: string;
  icon: IconName;
}

export function InfoCard() {
  const {ds, theme} = useTheme();

  const quickActions: QuickAction[] = [
    {name: 'Add', icon: AppIcons.actions.add},
    {name: 'Move', icon: AppIcons.actions.move},
    {name: 'Scan', icon: AppIcons.actions.scan},
    {name: 'Maintain', icon: AppIcons.business.maintenance},
    {name: 'Print', icon: AppIcons.content.print},
    {name: 'Categories', icon: AppIcons.inventory.categories},
    {name: 'Suppliers', icon: AppIcons.business.suppliers},
    {name: 'Events', icon: AppIcons.business.events},
    {name: 'Documents', icon: AppIcons.content.document},
    {name: 'Locations', icon: AppIcons.inventory.locations},
    {name: 'Items', icon: AppIcons.inventory.items},
  ];

  const renderAction = ({item}: {item: QuickAction}) => (
    <TouchableOpacity style={styles.actionButton}>
      <View style={styles.iconContainer}>
        <Icon name={item.icon} size={ds.iconSize.xxl} colorToken="quickActionIcon" />
      </View>
      <ThemedText style={styles.actionLabel}>{item.name}</ThemedText>
    </TouchableOpacity>
  );

  const styles = StyleSheet.create({
    card: {
      marginHorizontal: -ds.layout.screenPadding,
    },
    actionButton: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 79,
      paddingVertical: ds.spacing.md,
      // marginRight: ds.spacing.sm,
      gap: ds.spacing.xs,
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

  return (
    <View style={styles.card}>
      <FlatList
        data={quickActions}
        renderItem={renderAction}
        keyExtractor={(item) => item.name}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}
