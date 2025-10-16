import React, {useMemo} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import type {MenuItem} from '@/types';
import {Icon, AppIcons} from '@/utils';
import {makeStyleFactory} from '@/utils/style-factory';
import {ThemedText} from '../../components/ui/themed-text';

export function QuickActions() {
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
        <Icon
          name={item.icon}
          size={ds.iconSize.xxl}
          colorToken="quickActionIcon"
        />
      </View>
      <ThemedText style={styles.actionLabel}>{item.label}</ThemedText>
    </TouchableOpacity>
  );

  const styles = createStyles(ds, theme);

  return (
    <View style={styles.card}>
      {Platform.OS === 'web' ? (
        <View style={styles.webGrid}>
          {quickActions.map((item) => (
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
    const contentStylesMobile = {
      // Mobile uses FlatList, no styles needed
    };

    return StyleSheet.create({
      card: Platform.select({
        web: containerStylesWeb,
        default: containerStylesMobile,
      }) as ViewStyle,
      webGrid: Platform.select({
        web: contentStylesWeb,
        default: contentStylesMobile,
      }) as ViewStyle,
      actionButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: ds.spacing.md,
        gap: ds.spacing.xs,
        minWidth: 78.5,
      } as ViewStyle,
      iconContainer: {
        width: 48,
        height: 48,
        borderRadius: ds.borderRadius.full,
        backgroundColor: theme.secondary,
        alignItems: 'center',
        justifyContent: 'center',
      } as ViewStyle,
      actionLabel: {
        ...ds.typography.footnote,
        textAlign: 'center',
        color: theme.muted,
        fontWeight: ds.fontWeight.semibold,
      } as TextStyle,
    });
  },
  (ds, theme) => themeKey(theme, ds),
);
