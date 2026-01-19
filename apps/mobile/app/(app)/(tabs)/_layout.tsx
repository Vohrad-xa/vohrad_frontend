import {useEffect, useRef} from 'react';
import {Platform, StyleSheet} from 'react-native';
import {Tabs, useSegments} from 'expo-router';
import {
  NativeTabs,
  Icon as SFSymbol,
  Label,
  type IconProps,
} from 'expo-router/unstable-native-tabs';

import {Palette} from '@/constants';
import {type DSShape, type ThemeShape, themeKey} from '@/constants';
import {useHaptic, useTheme} from '@/providers';
import {AppIcons, Icon, makeStyleFactory, type IconName} from '@/utils';

const TAB_NAMES = ['dashboard', 'items', 'vault', 'settings'] as const;
type TabName = (typeof TAB_NAMES)[number];
type TabsRoute = `/(app)/(tabs)/${TabName}`;

type TabConfig = {
  name: TabName;
  title: string;
  icon: {default: IconName; selected: IconName};
};

type Sf = IconProps['sf'];

const INITIAL_TAB: TabName = 'dashboard';
export const unstable_settings = {initialRouteName: INITIAL_TAB} as const;

const TAB_SET = new Set<string>(TAB_NAMES);
function isTabName(v: string | undefined): v is TabName {
  return typeof v === 'string' && TAB_SET.has(v);
}

const TABS: readonly TabConfig[] = [
  {
    name: 'dashboard',
    title: 'Dashboard',
    icon: {default: AppIcons.tabs.homeOutline, selected: AppIcons.tabs.home},
  },
  {
    name: 'items',
    title: 'Items',
    icon: {default: AppIcons.tabs.itemOutline, selected: AppIcons.tabs.item},
  },
  {
    name: 'vault',
    title: 'Vault',
    icon: {default: AppIcons.tabs.vaultOutline, selected: AppIcons.tabs.vault},
  },
  {
    name: 'settings',
    title: 'Settings',
    icon: {
      default: AppIcons.tabs.settingsOutline,
      selected: AppIcons.tabs.settings,
    },
  },
];

export default function TabLayout() {
  const segments = useSegments<TabsRoute>();
  const {triggerHaptic} = useHaptic();
  const {theme, ds} = useTheme();
  const prev = useRef<TabName | null>(null);
  const styles = createStyles(ds, theme);

  useEffect(() => {
    if (segments[1] !== '(tabs)') return;

    const active: TabName = isTabName(segments[2]) ? segments[2] : INITIAL_TAB;

    if (prev.current && prev.current !== active) triggerHaptic('light');
    prev.current = active;
  }, [segments, triggerHaptic]);

  if (Platform.OS === 'ios') {
    return (
      <NativeTabs minimizeBehavior="automatic" tintColor={theme.tint}>
        {TABS.map((t) => (
          <NativeTabs.Trigger key={t.name} name={t.name}>
            <SFSymbol sf={t.icon as Sf} selectedColor={Palette.blue} />
            <Label>{t.title}</Label>
          </NativeTabs.Trigger>
        ))}
      </NativeTabs>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.tint2,
        tabBarInactiveTintColor: theme.text,
        tabBarLabelStyle: styles.label,
        tabBarStyle: styles.bar,
        tabBarHideOnKeyboard: true,
        tabBarVisibilityAnimationConfig: {
          show: {animation: 'spring', config: {stiffness: 400, damping: 40}},
        },
        animation: 'fade',
        transitionSpec: {animation: 'timing', config: {duration: 80}},
        lazy: true,
        freezeOnBlur: true,
      }}
    >
      {TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarIcon: ({color, focused}) => (
              <Icon
                name={focused ? t.icon.selected : t.icon.default}
                color={color}
                size={ds.iconSize.md}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      bar: {
        backgroundColor: theme.background,
        elevation: 0,
        shadowOpacity: 0,
        paddingHorizontal: ds.spacing.lg,
      },
      label: {
        fontSize: 10,
        fontWeight: ds.fontWeight.medium,
        letterSpacing: 0.2,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
