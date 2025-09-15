import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { View } from 'react-native';
import Switch from '@/components/ui/Switch';
import { Tokens } from '@/constants/colors';
import { useTheme } from '@/providers/theme-provider';
import Icon, { AppIcons } from '@/utils/icons';

export default function TabLayout() {
  const { scheme, toggle } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Tokens[scheme].tint,
        tabBarInactiveTintColor: Tokens[scheme].tabIconDefault,
        tabBarStyle: { backgroundColor: Tokens[scheme].surface, borderTopColor: Tokens[scheme].border },
        headerShown: true,
        headerStyle: { backgroundColor: Tokens[scheme].surface },
        headerTintColor: Tokens[scheme].text,
        headerTitleStyle: { color: Tokens[scheme].text },
        tabBarButton: HapticTab,
        headerRight: () => (
          <View style={{ marginRight: 12 }}>
            <Switch value={scheme === 'dark'} onValueChange={(_v) => toggle()} />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Icon size={28} name={AppIcons.navigation.home} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'More',
          tabBarIcon: ({ color }) => <Icon size={28} name={AppIcons.navigation.menu} color={color} />,
        }}
      />
    </Tabs>
  );
}
