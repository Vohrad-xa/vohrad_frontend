import {useMemo, useCallback, useRef, useState} from 'react';
import type {ReactNode} from 'react';
import {StyleSheet, View, Platform} from 'react-native';
import type {ListRenderItem} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  ThemedView,
  ThemedText,
  Divider,
  ListItem,
  ModalFlatList,
} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {BiometricToggle} from '@/features/settings/app-settings';
import {AppearanceMenu} from '@/features/settings/appearance-menu';
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
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const appearanceAnchorRef = useRef<View>(null);
  const containerRef = useRef<View>(null);

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

  const openAppearanceMenu = useCallback(() => {
    setThemeMenuOpen(true);
  }, []);

  const renderItem: ListRenderItem<SettingsListItem> = useCallback(
    ({item}) => {
      if (isDividerItem(item)) {
        return <Divider style={styles.divider} />;
      }

      let accessory: ReactNode = null;

      if (isToggleItem(item)) {
        if (item.id === 'biometric-unlock') {
          accessory = <BiometricToggle />;
        }
      } else if (item.id === 'appearance') {
        accessory = (
          <>
            <ThemedText style={styles.themeStatusText}>
              {preference === 'system'
                ? 'System'
                : preference === 'light'
                  ? 'Light'
                  : 'Dark'}
            </ThemedText>
            <Icon name={AppIcons.navigation.forward} color={theme.muted} />
          </>
        );
      } else if (!item.isDestructive) {
        accessory = (
          <Icon name={AppIcons.navigation.forward} color={theme.muted} />
        );
      }

      const content = (
        <ListItem
          label={item.label}
          icon={item.icon}
          onPress={item.id === 'appearance' ? openAppearanceMenu : item.onPress}
          isDestructive={item.isDestructive}
        >
          {accessory}
        </ListItem>
      );

      if (item.id === 'appearance') {
        return (
          <View ref={appearanceAnchorRef} collapsable={false}>
            {content}
          </View>
        );
      }

      return content;
    },
    [openAppearanceMenu, preference, styles, theme],
  );

  return (
    <View
      ref={containerRef}
      collapsable={false}
      style={styles.containerWrapper}
    >
      <ThemedView style={styles.container}>
        <ModalFlatList
          data={allSettingsItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.modalFlatListContent}
          showsVerticalScrollIndicator
        />

        <AppearanceMenu
          isOpen={themeMenuOpen}
          onClose={() => {
            setThemeMenuOpen(false);
          }}
          anchorRef={appearanceAnchorRef}
          containerRef={containerRef}
        />
      </ThemedView>
    </View>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape, insetsBottom: number) =>
    StyleSheet.create({
      containerWrapper: {
        flex: 1,
      },
      container: {
        flex: 1,
        backgroundColor:
          Platform.OS === 'web' ? theme.background : theme.secondbackground,
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
      modalFlatListContent: {
        paddingBottom: insetsBottom + ds.spacing.xl,
      },
    }),
  (ds, theme, insetsBottom) => themeKey(theme, ds) + `|${insetsBottom}`,
);
