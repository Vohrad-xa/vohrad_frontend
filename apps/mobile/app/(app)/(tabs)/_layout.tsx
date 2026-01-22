import {NativeTabs} from 'expo-router/unstable-native-tabs';
import {useTheme} from '@/providers';
import type {AndroidSymbol} from 'expo-symbols';
import type {SFSymbol} from 'sf-symbols-typescript';

type TabName = 'dashboard' | 'items' | 'vault' | 'settings';

type TabConfig = {
  name: TabName;
  title: string;
  androidIcon: AndroidSymbol;
  iosSymbol: {default: SFSymbol; selected: SFSymbol};
};

const TABS: readonly TabConfig[] = [
  {
    name: 'dashboard',
    title: 'Dashboard',
    androidIcon: 'home',
    iosSymbol: {default: 'house', selected: 'house.fill'},
  },
  {
    name: 'items',
    title: 'Items',
    androidIcon: 'dashboard',
    iosSymbol: {
      default: 'rectangle.3.group',
      selected: 'rectangle.3.offgrid.fill',
    },
  },
  {
    name: 'vault',
    title: 'Vault',
    androidIcon: 'folder',
    iosSymbol: {default: 'internaldrive', selected: 'internaldrive.fill'},
  },
  {
    name: 'settings',
    title: 'Settings',
    androidIcon: 'settings',
    iosSymbol: {default: 'gear.circle', selected: 'gear'},
  },
];

export default function TabLayout() {
  const {theme} = useTheme();

  return (
    <NativeTabs
      labelVisibilityMode="labeled"
      backgroundColor={theme.sidebarBackground}
      iconColor={{default: theme.text, selected: '#0773a5'}}
      indicatorColor="#8da5b751"
      rippleColor={theme.ripple}
      minimizeBehavior="onScrollDown"
      labelStyle={{
        default: {color: theme.text},
        selected: {color: '#0773a5'},
      }}
      backBehavior="initialRoute"
    >
      {TABS.map((t) => (
        <NativeTabs.Trigger key={t.name} name={t.name}>
          <NativeTabs.Trigger.Icon sf={t.iosSymbol} md={t.androidIcon} />
          <NativeTabs.Trigger.Label>{t.title}</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
