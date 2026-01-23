import {useEffect, useRef} from 'react';
import {useSegments} from 'expo-router';
import {
  NativeTabs,
  type SFSymbolIcon,
  type MaterialIcon,
} from 'expo-router/unstable-native-tabs';

import {Palette} from '@/constants';
import {useHaptic, useTheme} from '@/providers';

const TAB_NAMES = ['dashboard', 'items', 'vault', 'settings'] as const;
type TabName = (typeof TAB_NAMES)[number];
type TabsRoute = `/(app)/(tabs)/${TabName}`;

type TabConfig = {
  name: TabName;
  title: string;
  sf: SFSymbolIcon['sf'];
  md: MaterialIcon['md'];
};

const INITIAL_TAB: TabName = 'dashboard';
export const unstable_settings = {initialRouteName: INITIAL_TAB} as const;

const TAB_SET = new Set<string>(TAB_NAMES);
function isTabName(v: string | undefined): v is TabName {
  return typeof v === 'string' && TAB_SET.has(v);
}

const TABS: readonly TabConfig[] = [
  {
    name: 'dashboard',
    title: 'Home',
    sf: {
      default: 'house',
      selected: 'house.fill',
    },
    md: 'home',
  },
  {
    name: 'items',
    title: 'Items',
    sf: {
      default: 'square.grid.2x2',
      selected: 'square.grid.2x2.fill',
    },
    md: 'grid_view',
  },
  {
    name: 'vault',
    title: 'Vault',
    sf: {
      default: 'folder',
      selected: 'folder.fill',
    },
    md: 'folder_zip',
  },
  {
    name: 'settings',
    title: 'Settings',
    sf: {
      default: 'gearshape',
      selected: 'gearshape.fill',
    },
    md: 'settings',
  },
];

export default function TabLayout() {
  const segments = useSegments<TabsRoute>();
  const {triggerHaptic} = useHaptic();
  const {theme, ds} = useTheme();
  const prev = useRef<TabName | null>(null);

  useEffect(() => {
    if (segments[1] !== '(tabs)') return;

    const active: TabName = isTabName(segments[2]) ? segments[2] : INITIAL_TAB;

    if (prev.current && prev.current !== active) triggerHaptic('light');
    prev.current = active;
  }, [segments, triggerHaptic]);

  return (
    <NativeTabs
      minimizeBehavior="automatic"
      tintColor={theme.tint}
      indicatorColor={theme.secondary}
      rippleColor={'transparent'}
      backgroundColor={theme.sidebarBackground}
      labelVisibilityMode="labeled"
      backBehavior="history"
    >
      {TABS.map((t) => (
        <NativeTabs.Trigger key={t.name} name={t.name}>
          <NativeTabs.Trigger.Icon
            selectedColor={Palette.blue}
            sf={t.sf}
            md={t.md}
          />
          <NativeTabs.Trigger.Label>{t.title}</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
