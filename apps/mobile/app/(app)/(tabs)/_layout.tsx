import React, {useEffect} from 'react';
import type {ComponentProps} from 'react';
import {Platform, View, type ColorValue, type ImageSourcePropType} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {Tabs, useNavigation, useSegments} from 'expo-router';
import {Icon, NativeTabs, Label, VectorIcon} from 'expo-router/unstable-native-tabs';
import {useTheme} from '@/providers';
import type {TabItem} from '@/types/ui';
import {AppIcons, type IconName} from '@/utils';

const TAB_ITEMS: TabItem[] = [
  {name: 'index', label: 'Dashboard', icon: AppIcons.navigation.home},
  {name: 'items', label: 'Items', icon: AppIcons.inventory.items},
  {name: 'locations', label: 'Locations', icon: AppIcons.inventory.locations},
  {name: 'events', label: 'Events', icon: AppIcons.navigation.events},
];

interface IoniconsModule {
  getImageSource: (name: IconName, size: number, color: ColorValue) => Promise<ImageSourcePropType>;
}

const IoniconsFamily: IoniconsModule = {
  getImageSource: async (name: IconName, size: number, color: ColorValue) => {
    if (Platform.OS === 'web') {
      return {uri: ''};
    }
    const result = await Ionicons.getImageSource(name as keyof typeof Ionicons.glyphMap, size, color as string);
    return result ?? {uri: ''};
  },
};

export default function TabLayout() {
  const navigation = useNavigation();
  const segments = useSegments();
  const {theme} = useTheme();

  useEffect(() => {
    const currentTab = segments[segments.length - 1] as string;
    const activeTab = TAB_ITEMS.find((tab) => tab.name === currentTab);
    navigation.setOptions({title: activeTab?.label ?? 'Dashboard'});
  }, [segments, navigation]);

  if (Platform.OS === 'web') {
    return (
      <View style={{flex: 1, backgroundColor: theme.background}}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: theme.tabIconSelected,
            tabBarInactiveTintColor: theme.icon,
          }}>
          {TAB_ITEMS.map((tab) => (
            <Tabs.Screen
              key={tab.name}
              name={tab.name}
              options={{
                title: tab.label,
                tabBarIcon: ({color, size}) => (
                  <Ionicons
                    name={tab.icon as ComponentProps<typeof Ionicons>['name']}
                    size={size ?? 24}
                    color={color ?? theme.icon}
                  />
                ),
              }}
            />
          ))}
        </Tabs>
      </View>
    );
  }

  return (
    <NativeTabs
      labelVisibilityMode={Platform.select({
        android: 'unlabeled',
        default: 'labeled',
      })}
      minimizeBehavior={Platform.select({
        ios: 'onScrollDown',
        default: undefined,
      })}
      disableIndicator={false}
      backgroundColor={theme.navigationBar}
      iconColor={theme.icon}
      tintColor={theme.tabIconSelected}
      indicatorColor={theme.card}>
      {TAB_ITEMS.map((tab) => (
        <NativeTabs.Trigger key={tab.name} name={tab.name}>
          <Label>{tab.label}</Label>
          <Icon src={<VectorIcon family={IoniconsFamily} name={tab.icon} />} />
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
