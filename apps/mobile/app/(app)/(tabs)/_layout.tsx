import React, {useEffect, useRef} from 'react';
import {Platform} from 'react-native';
import {useNavigation, useSegments} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {NativeTabsComponent, ReactTabs} from '@/components/navigation';
import {useHaptic, useTheme} from '@/providers';
import type {TabItem} from '@/types/ui';
import {AppIcons, SFSymbols} from '@/utils';

const TAB_ITEMS: TabItem[] = [
  {name: 'dashboard', label: 'Dashboard', icon: AppIcons.navigation.home},
  {name: 'items', label: 'Items', icon: AppIcons.inventory.itemsSecondary},
  {name: 'vault', label: 'Vault', icon: AppIcons.navigation.vault},
  {name: 'events', label: 'Events', icon: AppIcons.navigation.events},
];

const iOS_SF_SYMBOLS = {
  dashboard: SFSymbols.houseFill,
  items: SFSymbols.rectangleStackFill,
  vault: SFSymbols.folderFill,
  events: SFSymbols.bellFill,
} as const;

export const unstable_settings = {
  initialRouteName: 'dashboard',
};

export default function TabLayout() {
  const navigation = useNavigation();
  const segments = useSegments();
  const {theme, ds, scheme} = useTheme();
  const {triggerHaptic} = useHaptic();
  const insets = useSafeAreaInsets();
  const previousTabRef = useRef<string | null>(null);

  useEffect(() => {
    const currentSegment = segments[segments.length - 1] ?? 'dashboard';
    const activeTab =
      TAB_ITEMS.find((tab) => tab.name === currentSegment) ?? TAB_ITEMS[0];

    if (previousTabRef.current && previousTabRef.current !== activeTab.name) {
      triggerHaptic('light');
    }
    previousTabRef.current = activeTab.name;
  }, [segments, navigation, triggerHaptic]);

  if (Platform.OS === 'ios') {
    return (
      <NativeTabsComponent
        tabs={TAB_ITEMS}
        iosSFSymbols={iOS_SF_SYMBOLS}
        theme={theme}
      />
    );
  }

  return (
    <ReactTabs
      tabs={TAB_ITEMS}
      theme={theme}
      ds={ds}
      insetBottom={insets.bottom}
      scheme={scheme}
    />
  );
}
