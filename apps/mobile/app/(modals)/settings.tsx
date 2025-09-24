import {useMemo, useCallback} from 'react';
import {StyleSheet, Platform, FlatList, type ListRenderItem} from 'react-native';
import {StatusBar as ExpoStatusBar} from 'expo-status-bar';
import {ThemedView, ThemedText, Divider, ListItem, Switch, WebHeader} from '@/components/ui';
import type {Tokens} from '@/constants/colors';
import type {DesignSystem} from '@/constants/typography';
import {
  isDividerItem,
  type ListItem as SettingsListItem,
  type SettingsItem,
  type ToggleSettingsItem,
} from '@/features/settings/types';
import {useSettingsItems} from '@/features/settings/use-settings-items';
import {useTheme} from '@/providers';
import {Icon, AppIcons} from '@/utils';

const destructiveItems: SettingsItem[] = [
  {
    id: 'logout',
    icon: AppIcons.actions.logout,
    label: 'Logout',
    isDestructive: true,
    onPress: () => {
      // TODO: Implement logout functionality
    },
  },
];

// Type guard to check for toggle items
const isToggleItem = (item: SettingsListItem): item is ToggleSettingsItem => 'hasToggle' in item;

export default function SettingsModal() {
  const {ds, theme, preference} = useTheme();
  const styles = createStyles(ds, theme);
  const computedSettingsItems = useSettingsItems();

  const allSettingsItems = useMemo(() => {
    const itemsWithDividers: SettingsListItem[] = [];

    computedSettingsItems.forEach((item) => {
      itemsWithDividers.push(item);
      if (item.showDividerAfter) {
        itemsWithDividers.push({id: `divider-${item.id}`, isDivider: true});
      }
    });

    itemsWithDividers.push({id: 'main-divider', isDivider: true});

    destructiveItems.forEach((item) => {
      itemsWithDividers.push(item);
    });

    return itemsWithDividers;
  }, [computedSettingsItems]);

  const renderItem: ListRenderItem<SettingsListItem> = useCallback(
    ({item}) => {
      if (isDividerItem(item)) {
        return <Divider style={styles.divider} />;
      }

      return (
        <ListItem label={item.label} icon={item.icon} onPress={item.onPress} isDestructive={item.isDestructive}>
          {isToggleItem(item) ? (
            <>
              {item.id === 'appearance' && (
                <ThemedText style={styles.themeStatusText}>
                  {preference === 'system' ? 'System' : preference === 'light' ? 'Light' : 'Dark'}
                </ThemedText>
              )}
              <Switch
                style={{
                  alignSelf: 'auto',
                  minWidth: ds.iconSize.md,
                  minHeight: ds.iconSize.md,
                }}
              />
            </>
          ) : (
            !item.isDestructive && <Icon name={AppIcons.navigation.forward} size={ds.iconSize.md} color={theme.muted} />
          )}
        </ListItem>
      );
    },
    [ds, theme, styles, preference],
  );

  return (
    <ThemedView style={styles.container}>
      <WebHeader title="Settings" />

      <FlatList
        data={allSettingsItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContentContainer}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator
      />

      <ExpoStatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </ThemedView>
  );
}

const createStyles = (ds: typeof DesignSystem, theme: typeof Tokens.light | typeof Tokens.dark) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContainer: {
      flex: 1,
    },
    scrollContentContainer: {
      paddingHorizontal: ds.spacing.xl,
    },
    divider: {
      marginVertical: ds.spacing.sm,
    },
    themeStatusText: {
      ...ds.typography.secondary,
      color: theme.muted,
      fontWeight: ds.fontWeight.medium,
      marginRight: ds.spacing.sm,
    },
  });
