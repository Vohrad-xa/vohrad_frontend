import React, {useEffect, useRef} from 'react';
import {Platform} from 'react-native';
import {useNavigation, useSegments} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {NativeTabsComponent} from '@/components/navigation/native-tabs';
import {ReactTabs} from '@/components/navigation/react-tabs';
import {useHaptic, useTheme} from '@/providers';
import type {TabItem} from '@/types/ui';
import {AppIcons} from '@/utils';

const TAB_ITEMS: TabItem[] = [
  {name: 'home', label: 'Home', icon: AppIcons.navigation.home},
  {name: 'locations', label: 'Locations', icon: AppIcons.inventory.locations},
  {name: 'events', label: 'Events', icon: AppIcons.navigation.events},
];

const iOS_SF_SYMBOLS = {
  home: 'house.fill',
  locations: 'map.fill',
  events: 'bell.fill',
} as const;

export default function TabLayout() {
  const navigation = useNavigation();
  const segments = useSegments();
  const {theme, ds} = useTheme();
  const {triggerHaptic} = useHaptic();
  const insets = useSafeAreaInsets();
  const previousTabRef = useRef<string | null>(null);

  useEffect(() => {
    const currentSegment = segments[segments.length - 1] ?? 'home';
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
    />
  );
}
