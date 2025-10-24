import React, {useEffect, useRef} from 'react';
import type {ComponentProps} from 'react';
import {Platform, View, StyleSheet} from 'react-native';
import {Ionicons, MaterialIcons} from '@expo/vector-icons';
import {Tabs, useNavigation, useSegments} from 'expo-router';
import {
  Icon,
  NativeTabs,
  Label,
  VectorIcon,
} from 'expo-router/unstable-native-tabs';
import {type ThemeShape} from '@/constants/theme';
import {useHaptic, useTheme} from '@/providers';
import type {TabItem} from '@/types/ui';
import {AppIcons} from '@/utils';
import {makeStyleFactory} from '@/utils/style-factory';

export const unstable_settings = {
  initialRouteName: 'dashboard',
};

const TAB_ITEMS: TabItem[] = [
  {name: 'dashboard', label: 'Dashboard', icon: AppIcons.navigation.home},
  {name: 'items', label: 'Items', icon: AppIcons.inventory.items},
  {name: 'locations', label: 'Locations', icon: AppIcons.inventory.locations},
  {name: 'events', label: 'Events', icon: AppIcons.navigation.events},
];

// Icon mappings for different platforms
const iOS_SF_SYMBOLS = {
  dashboard: 'house.fill',
  items: 'folder.fill',
  locations: 'map.fill',
  events: 'bell.fill',
} as const;

const ANDROID_MATERIAL_ICONS = {
  dashboard: 'dashboard',
  items: 'inventory',
  locations: 'edit-location',
  events: 'notifications',
} as const;

export default function TabLayout() {
  const navigation = useNavigation();
  const segments = useSegments();
  const {theme} = useTheme();
  const {triggerHaptic} = useHaptic();
  // const {toggleSideMenu} = useSidebar();
  const styles = createStyles(theme);
  const previousTabRef = useRef<string | null>(null);
  useEffect(() => {
    const currentSegment = segments[segments.length - 1] ?? 'dashboard';
    const activeTab =
      TAB_ITEMS.find((tab) => tab.name === currentSegment) ?? TAB_ITEMS[0];

    if (previousTabRef.current && previousTabRef.current !== activeTab.name) {
      triggerHaptic('selection');
    }
    previousTabRef.current = activeTab.name;

    // Hide header for all tabs since they now use Stack layouts
    navigation.setOptions({
      headerShown: false,
    });
  }, [segments, navigation, triggerHaptic]);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: theme.tabIconSelected,
            tabBarInactiveTintColor: theme.icon,
          }}
        >
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
      tintColor={theme.tabIconSelected}
      indicatorColor={theme.card}
      iconColor={Platform.OS === 'android' ? theme.icon : undefined}
    >
      {TAB_ITEMS.map((tab) => (
        <NativeTabs.Trigger key={tab.name} name={tab.name}>
          <Label>{tab.label}</Label>
          {Platform.select({
            ios: (
              <Icon
                sf={iOS_SF_SYMBOLS[tab.name as keyof typeof iOS_SF_SYMBOLS]}
              />
            ),
            android: (
              <Icon
                src={
                  <VectorIcon
                    family={MaterialIcons}
                    name={
                      ANDROID_MATERIAL_ICONS[
                        tab.name as keyof typeof ANDROID_MATERIAL_ICONS
                      ]
                    }
                  />
                }
              />
            ),
          })}
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}

const createStyles = makeStyleFactory(
  (theme: ThemeShape) =>
    StyleSheet.create({
      headerStyleAndroid: {
        backgroundColor: theme.navigationBar,
      },
      headerTitleStyle: {
        color: theme.text,
      },
      webContainer: {
        flex: 1,
        backgroundColor: theme.background,
      },
    }),
  (theme) => theme.version.toString(),
);
