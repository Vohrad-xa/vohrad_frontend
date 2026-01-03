import {Platform} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {
  NativeTabs,
  Icon,
  Label,
  VectorIcon,
} from 'expo-router/unstable-native-tabs';
import {useTheme} from '@/providers';
import type {SFSymbol} from 'sf-symbols-typescript';

type TabName = 'dashboard' | 'items' | 'vault' | 'settings';

type TabConfig = {
  name: TabName;
  title: string;
  androidIcon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  iosSymbol: SFSymbol | {default: SFSymbol; selected: SFSymbol};
};

type IconSfProp = SFSymbol | {default: SFSymbol; selected: SFSymbol};

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
    androidIcon: 'view-dashboard',
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
    androidIcon: 'cog',
    iosSymbol: {default: 'gear.circle', selected: 'gear'},
  },
];

export default function TabLayout() {
  const {theme} = useTheme();

  return (
    <NativeTabs
      labelVisibilityMode="labeled"
      backgroundColor={theme.sidebarBackground}
      iconColor={{default: theme.text}}
      indicatorColor={theme.ripple}
      minimizeBehavior="automatic"
      labelStyle={{
        default: {color: theme.text},
        selected: {color: theme.accentBlue},
      }}
    >
      {TABS.map((t) => (
        <NativeTabs.Trigger
          key={t.name}
          name={t.name}
          options={{selectedIconColor: theme.accentBlue}}
        >
          {Platform.OS === 'ios' ? (
            <Icon sf={t.iosSymbol as IconSfProp} />
          ) : (
            <Icon
              src={
                <VectorIcon
                  family={MaterialCommunityIcons}
                  name={t.androidIcon}
                />
              }
            />
          )}
          <Label>{t.title}</Label>
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
