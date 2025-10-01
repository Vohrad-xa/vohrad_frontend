import {useMemo, useCallback} from 'react';
import type {ReactNode} from 'react';
import {StyleSheet, Platform, FlatList} from 'react-native';
import type {ListRenderItem} from 'react-native';
import {StatusBar as ExpoStatusBar} from 'expo-status-bar';
import {ThemedView, ThemedText, Divider, ListItem, Switch} from '@/components/ui';
import type {DesignSystem} from '@/constants/typography';
import {BiometricToggle} from '@/features/settings/biometric-toggle';
import {
  isDividerItem,
  type ListItem as SettingsListItem,
  type SettingsItem,
  type ToggleSettingsItem,
} from '@/features/settings/types';
import {useSettingsItems} from '@/features/settings/use-settings-items';
import {useTheme, useAuth} from '@/providers';
import {Icon, AppIcons} from '@/utils';
type ThemeType = ReturnType<typeof useTheme>['theme'];

export default function SettingsModal() {
  const {ds, theme, preference} = useTheme();
  const {logout} = useAuth();
  const styles = createStyles(ds, theme);
  const computedSettingsItems = useSettingsItems();

  // Type guard to check for toggle items
  const isToggleItem = (item: SettingsListItem): item is ToggleSettingsItem => 'hasToggle' in item;

  const allSettingsItems = useMemo(() => {
    const itemsWithDividers: SettingsListItem[] = [];

    const destructiveItems: SettingsItem[] = [
      {
        id: 'logout',
        icon: AppIcons.actions.logout,
        label: 'Logout',
        isDestructive: true,
        onPress: () => {
          logout();
        },
      },
    ];

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
  }, [computedSettingsItems, logout]);

  const renderItem: ListRenderItem<SettingsListItem> = useCallback(
    ({item}) => {
      if (isDividerItem(item)) {
        return <Divider style={styles.divider} />;
      }

      let accessory: ReactNode = null;

      if (isToggleItem(item)) {
        if (item.id === 'appearance') {
          accessory = (
            <>
              <ThemedText style={styles.themeStatusText}>
                {preference === 'system' ? 'System' : preference === 'light' ? 'Light' : 'Dark'}
              </ThemedText>
              <Switch
                style={{
                  alignSelf: 'auto',
                  minWidth: ds.iconSize.md,
                  minHeight: ds.iconSize.md,
                }}
              />
            </>
          );
        } else if (item.id === 'biometric-unlock') {
          accessory = <BiometricToggle />;
        }
      } else if (!item.isDestructive) {
        accessory = <Icon name={AppIcons.navigation.forward} size={ds.iconSize.md} color={theme.muted} />;
      }

      return (
        <ListItem label={item.label} icon={item.icon} onPress={item.onPress} isDestructive={item.isDestructive}>
          {accessory}
        </ListItem>
      );
    },
    [ds, theme, styles, preference],
  );

  return (
    <ThemedView style={styles.container}>
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

const createStyles = (ds: typeof DesignSystem, theme: ThemeType) =>
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
