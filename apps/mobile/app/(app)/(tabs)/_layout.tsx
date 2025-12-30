import React, {useEffect, useRef} from 'react';
import {Platform, View, StyleSheet} from 'react-native';
import {Tabs, useSegments} from 'expo-router';
import {
  NativeTabs,
  Icon as NativeTabIcon,
  Label,
} from 'expo-router/unstable-native-tabs';
import type {DSShape, ThemeShape} from '@/constants/theme';
import {themeKey} from '@/constants/theme';
import {useHaptic, useTheme} from '@/providers';
import {AppIcons, Icon, makeStyleFactory} from '@/utils';

const TABS = [
  {name: 'dashboard', title: 'Dashboard', icon: AppIcons.tabs.home},
  {name: 'items', title: 'Items', icon: AppIcons.tabs.item},
  {name: 'vault', title: 'Vault', icon: AppIcons.tabs.vault},
  {name: 'settings', title: 'Settings', icon: AppIcons.tabs.settings},
] as const;

type TabName = (typeof TABS)[number]['name'];
type TabsRoute = `/(app)/(tabs)/${TabName}`;

export const unstable_settings = {initialRouteName: 'dashboard'};

function isTabName(v: string | undefined): v is TabName {
  return (
    v === 'dashboard' || v === 'items' || v === 'vault' || v === 'settings'
  );
}

export default function TabLayout() {
  const segments = useSegments<TabsRoute>();
  const {triggerHaptic} = useHaptic();
  const {theme, ds} = useTheme();
  const prev = useRef<TabName | null>(null);
  const styles = createStyles(ds, theme);

  useEffect(() => {
    if (segments[1] !== '(tabs)') return;
    const tab = segments[2];
    const active: TabName = isTabName(tab) ? tab : 'dashboard';

    if (prev.current && prev.current !== active) triggerHaptic('light');
    prev.current = active;
  }, [segments, triggerHaptic]);

  if (Platform.OS === 'ios') {
    return (
      <NativeTabs>
        {TABS.map((t) => (
          <NativeTabs.Trigger key={t.name} name={t.name}>
            <NativeTabIcon sf={t.icon} selectedColor={theme.accentIndigo} />
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
        tabBarActiveTintColor: theme.accentBlue,
        tabBarInactiveTintColor: theme.text,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: styles.label,
        tabBarStyle: styles.bar,
      }}
    >
      {TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarIcon: ({color, size, focused}) => (
              <View style={styles.iconWrap}>
                {focused && <View style={styles.capsule} />}
                <Icon name={t.icon} color={color} size={size} />
              </View>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) => ({
    bar: {
      borderTopWidth: 0,
      backgroundColor: theme.sidebarBackground,
      elevation: 8,
      shadowOpacity: 0.1,
    },
    label: {
      ...ds.typography.caption,
      marginTop: ds.spacing.xxs,
      fontWeight: ds.fontWeight.semibold,
    },
    iconWrap: {
      width: ds.spacing.xxxl + ds.spacing.xl,
      height: ds.spacing.xxl,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    capsule: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.border,
      borderRadius: ds.borderRadius.full,
      opacity: 0.6,
    },
  }),
  (ds, theme) => themeKey(theme, ds),
);
