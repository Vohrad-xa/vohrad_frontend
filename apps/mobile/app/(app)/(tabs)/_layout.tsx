import React, {useEffect, useRef} from 'react';
import type {ComponentProps} from 'react';
import {Platform, View, StyleSheet} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {Tabs, useNavigation, useSegments} from 'expo-router';
import {Icon, NativeTabs, Label} from 'expo-router/unstable-native-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {type ThemeShape, type DSShape} from '@/constants/theme';
import {useHaptic, useTheme} from '@/providers';
import type {TabItem} from '@/types/ui';
import {AppIcons} from '@/utils';
import {makeStyleFactory} from '@/utils/style-factory';

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
  const styles = createStyles(theme, ds, insets.bottom);
  const previousTabRef = useRef<string | null>(null);

  useEffect(() => {
    const currentSegment = segments[segments.length - 1] ?? 'home';
    const activeTab =
      TAB_ITEMS.find((tab) => tab.name === currentSegment) ?? TAB_ITEMS[0];

    if (previousTabRef.current && previousTabRef.current !== activeTab.name) {
      triggerHaptic('selection');
    }
    previousTabRef.current = activeTab.name;
  }, [segments, navigation, triggerHaptic]);

  if (Platform.OS === 'ios') {
    return (
      <NativeTabs
        labelVisibilityMode="labeled"
        minimizeBehavior="onScrollDown"
        disableIndicator={false}
        backgroundColor={theme.navigationBar}
        tintColor={theme.tabIconSelected}
        indicatorColor={theme.card}
      >
        {TAB_ITEMS.map((tab) => (
          <NativeTabs.Trigger key={tab.name} name={tab.name}>
            <Label>{tab.label}</Label>
            <Icon
              sf={iOS_SF_SYMBOLS[tab.name as keyof typeof iOS_SF_SYMBOLS]}
            />
          </NativeTabs.Trigger>
        ))}
      </NativeTabs>
    );
  }

  return (
    <View style={styles.container}>
      <Tabs
        initialRouteName="home"
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.tabIconSelected,
          tabBarInactiveTintColor: theme.icon,
          tabBarStyle:
            Platform.OS === 'android' ? styles.tabBarAndroid : styles.tabBar,
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

const createStyles = makeStyleFactory(
  (theme: ThemeShape, ds: DSShape, insetBottom: number) =>
    StyleSheet.create({
      headerStyleAndroid: {
        backgroundColor: theme.navigationBar,
      },
      headerTitleStyle: {
        color: theme.text,
      },
      container: {
        flex: 1,
        backgroundColor: theme.background,
      },
      tabBar: {},
      tabBarAndroid: {
        height: ds.layout.tabBarHeight + insetBottom + ds.spacing.md,
        paddingBottom: insetBottom + ds.spacing.md,
        backgroundColor: theme.navigationBar,
      },
    }),
  (theme, ds, insetBottom) => `${theme.version.toString()}|${insetBottom}`,
);
