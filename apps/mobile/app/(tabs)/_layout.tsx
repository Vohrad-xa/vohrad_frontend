import { Tabs } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { View } from 'react-native';
import Switch from '@/components/ui/Switch';
import { GlassSurface } from '@/components/ui/glass-surface';
import { Tokens } from '@/constants/colors';
import { useTheme } from '@/providers/theme-provider';
import Icon, { AppIcons } from '@/utils/icons';

export default function TabLayout() {
  const { scheme, toggle } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Tokens[scheme].tint,
        tabBarInactiveTintColor: Tokens[scheme].tabIconDefault,
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          position: 'absolute',
        },
        tabBarBackground: () => (
          <GlassSurface
            style={{
              flex: 1,
            }}
          />
        ),
        headerShown: true,
        headerTransparent: true,
        headerStyle: { backgroundColor: 'transparent' },
        headerBackground: () => (
          <GlassSurface
            style={{
              flex: 1,
            }}
          />
        ),
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
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color }) => <Icon size={28} name={AppIcons.navigation.menu} color={color} />,
        }}
      />
    </Tabs>
  );
}
