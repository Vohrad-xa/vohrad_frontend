import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import Switch from '@/components/ui/Switch';
import { useTheme } from '@/providers/theme-provider';
import { ThemedView } from '@/components/ui/themed-view';
import { Icon, AppIcons } from '@/utils/icons';

export default function TabLayout() {
  const { scheme, toggle, theme, ds } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerTitleStyle: { color: theme.text },
        tabBarButton: HapticTab,
        tabBarActiveTintColor: theme.tabIconSelected,
        tabBarInactiveTintColor: theme.tabIconDefault,

        headerTitleAlign: 'center',

        headerLeft: () => (
          <ThemedView variant="headerAccessory">
            <Icon name={AppIcons.navigation.menu} />
          </ThemedView>
        ),

        headerRight: () => (
          <ThemedView variant="headerAccessory">
            <Switch value={scheme === 'dark'} onValueChange={(_v) => toggle()} />
          </ThemedView>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Icon name={AppIcons.navigation.home} color={color} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color }) => <Icon name={AppIcons.navigation.scan} color={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Icon name={AppIcons.navigation.settings} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Icon name={AppIcons.navigation.profile} color={color} />,
        }}
      />
    </Tabs>
  );
}
