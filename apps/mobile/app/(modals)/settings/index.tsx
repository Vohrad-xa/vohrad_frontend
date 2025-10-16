import {useMemo, useCallback} from 'react';
import type {ReactNode} from 'react';
import {StyleSheet, Platform} from 'react-native';
import type {ListRenderItem} from 'react-native';
import {StatusBar as ExpoStatusBar} from 'expo-status-bar';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  ThemedView,
  ThemedText,
  Divider,
  ListItem,
  Switch,
  ModalFlatList,
} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {BiometricToggle} from '@/features/settings/biometric';
import {
  isDividerItem,
  type ListItem as SettingsListItem,
  type SettingsItem,
  type ToggleSettingsItem,
} from '@/features/settings/types';
import {useSettingsItems} from '@/features/settings/use-settings-items';
import {useTheme, useAuth} from '@/providers';
import {Icon, AppIcons, showConfirmAlert} from '@/utils';
import {makeStyleFactory} from '@/utils/style-factory';

export default function SettingsModal() {
  const {ds, theme, preference} = useTheme();
  const {logout} = useAuth();
  const insets = useSafeAreaInsets();
  const styles = createStyles(ds, theme, insets.bottom);
  const computedSettingsItems = useSettingsItems();

  // Type guard to check for toggle items
  const isToggleItem = (item: SettingsListItem): item is ToggleSettingsItem =>
    'hasToggle' in item;

  const allSettingsItems = useMemo(() => {
    const itemsWithDividers: SettingsListItem[] = [];

    const destructiveItems: SettingsItem[] = [
      {
        id: 'logout',
        icon: AppIcons.actions.logout,
        label: 'Logout',
        isDestructive: true,
        onPress: () => {
          showConfirmAlert({
            title: 'Logout',
            message: 'Are you sure you want to logout?',
            confirmText: 'Logout',
            cancelText: 'Cancel',
            destructive: true,
            onConfirm: () => {
              logout();
            },
          });
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
                {preference === 'system'
                  ? 'System'
                  : preference === 'light'
                    ? 'Light'
                    : 'Dark'}
              </ThemedText>
              <Switch style={styles.appearanceSwitch} />
            </>
          );
        } else if (item.id === 'biometric-unlock') {
          accessory = <BiometricToggle />;
        }
      } else if (!item.isDestructive) {
        accessory = (
          <Icon name={AppIcons.navigation.forward} color={theme.muted} />
        );
      }

      return (
        <ListItem
          label={item.label}
          icon={item.icon}
          onPress={item.onPress}
          isDestructive={item.isDestructive}
        >
          {accessory}
        </ListItem>
      );
    },
    [theme, styles, preference],
  );

  return (
    <ThemedView style={styles.container}>
      <ModalFlatList
        data={allSettingsItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.modalFlatListContent}
        showsVerticalScrollIndicator
      />

      <ExpoStatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </ThemedView>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape, insetsBottom: number) =>
    StyleSheet.create({
      container: {
        flex: 1,
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
      appearanceSwitch: {
        alignSelf: 'auto',
        minWidth: ds.iconSize.md,
        minHeight: ds.iconSize.xs,
      },
      modalFlatListContent: {
        paddingBottom: insetsBottom + ds.spacing.xl,
      },
    }),
  (ds, theme, insetsBottom) => themeKey(theme, ds) + `|${insetsBottom}`,
);
