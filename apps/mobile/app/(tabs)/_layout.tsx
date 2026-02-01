import {useEffect, useRef} from 'react';
import {Platform} from 'react-native';
import {useSegments, Tabs} from 'expo-router';
import {
  NativeTabs,
  type SFSymbolIcon,
  type MaterialIcon,
} from 'expo-router/unstable-native-tabs';
import {useHaptic, useTheme} from '@/providers';
import {AppIcons, Icon, type IconName} from '@/utils/icons';

const TAB_NAMES = ['dashboard', 'items', 'vault', 'settings'] as const;
type TabName = (typeof TAB_NAMES)[number];
type TabsRoute = `/(tabs)/${TabName}`;

type TabConfig = {
  name: TabName;
  title: string;
  sf: SFSymbolIcon['sf'];
  md: MaterialIcon['md'];
  icon: IconName;
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
    icon: AppIcons.domain.home,
  },
  {
    name: 'items',
    title: 'Items',
    sf: {
      default: 'square.grid.2x2',
      selected: 'square.grid.2x2.fill',
    },
    md: 'grid_view',
    icon: AppIcons.domain.item,
  },
  {
    name: 'vault',
    title: 'Vault',
    sf: {
      default: 'folder',
      selected: 'folder.fill',
    },
    md: 'folder_zip',
    icon: AppIcons.domain.vault,
  },
  {
    name: 'settings',
    title: 'Settings',
    sf: {
      default: 'gearshape',
      selected: 'gearshape.fill',
    },
    md: 'settings',
    icon: AppIcons.domain.settings,
  },
];

export default function TabLayout() {
  const segments = useSegments<TabsRoute>();

  const {triggerHaptic} = useHaptic();

  const {theme, ds} = useTheme();

  const prev = useRef<TabName | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    if (segments[0] !== '(tabs)') return;

    const active: TabName = isTabName(segments[1]) ? segments[1] : INITIAL_TAB;

    if (prev.current && prev.current !== active) triggerHaptic('light');
    prev.current = active;
  }, [segments, triggerHaptic]);

  if (Platform.OS === 'web') {
    return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarPosition: 'left',
          tabBarVariant: 'material',
          tabBarActiveBackgroundColor: theme.tabIndicator,
          tabBarStyle: {
            justifyContent: 'space-evenly',
            backgroundColor: theme.tabBar,
            minWidth: 150,
          },
          tabBarItemStyle: {
            marginVertical: 10,
          },
          tabBarLabelStyle: {color: theme.text},
        }}
      >
        {TABS.map((t) => (
          <Tabs.Screen
            key={t.name}
            name={t.name}
            options={{
              title: t.title,
              tabBarInactiveBackgroundColor: theme.ripple,
              tabBarIcon: () => (
                <Icon name={t.icon} color={theme.text} size={ds.iconSize.lg} />
              ),
            }}
          />
        ))}
      </Tabs>
    );
  }

  return (
    <NativeTabs
      minimizeBehavior="automatic"
      backBehavior="history"
      rippleColor="transparent"
      labelVisibilityMode="labeled"
      tintColor={theme.tint2}
      indicatorColor={theme.tabIndicator}
      backgroundColor={theme.tabBar}
      iconColor={theme.text}
      labelStyle={{color: theme.text}}
    >
      {TABS.map((t) => (
        <NativeTabs.Trigger key={t.name} name={t.name}>
          <NativeTabs.Trigger.Icon sf={t.sf} md={t.md} />
          <NativeTabs.Trigger.Label>{t.title}</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
