import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { View } from 'react-native';
import Switch from '@/components/ui/Switch';
import { Tokens } from '@/constants/colors';
import { useTheme } from '@/providers/theme-provider';
import { Icon, AppIcons } from '@/utils/icons';

const HEADER_ACCESSORY_WIDTH = 56;

export default function TabLayout() {
  const { scheme, toggle } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerTitleStyle: { color: Tokens[scheme].text },
        tabBarButton: HapticTab,
        tabBarActiveTintColor: Tokens[scheme].tabIconSelected,
        tabBarInactiveTintColor: Tokens[scheme].tabIconDefault,

        headerTitleAlign: 'center',

        headerLeft: () => (
          <View
            style={{
              width: HEADER_ACCESSORY_WIDTH,
              marginLeft: 10,
              justifyContent: 'center',
              alignItems: 'flex-start',
            }}
          >
            <Icon name={AppIcons.navigation.menu} />
          </View>
        ),

        headerRight: () => (
          <View
            style={{
              width: HEADER_ACCESSORY_WIDTH,
              marginRight: 10,
              justifyContent: 'center',
              alignItems: 'flex-end',
            }}
          >
            <Switch value={scheme === 'dark'} onValueChange={(_v) => toggle()} />
          </View>
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
