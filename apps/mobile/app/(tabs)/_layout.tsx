import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { View } from 'react-native';
import Switch from '@/components/ui/Switch';
import { GlassSurface } from '@/components/ui/glass-surface';
import { Tokens, NavigationThemes, Palette } from '@/constants/colors';
import { useTheme } from '@/providers/theme-provider';
import { Icon, AppIcons } from '@/utils/icons';

const HEADER_ACCESSORY_WIDTH = 56;

export default function TabLayout() {
  const { scheme, toggle } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerTransparent: true,
        headerBackground: () => (
          <View style={{ flex: 1 }}>
            {scheme === 'light' ? (
              <View style={{ flex: 1, backgroundColor: Palette.black }} />
            ) : (
              <GlassSurface style={{ flex: 1 }} />
            )}
            <View style={{ height: 0.5, backgroundColor: NavigationThemes[scheme].colors.border }} />
          </View>
        ),
        tabBarStyle: {
          borderTopWidth: 0.5,
          borderTopColor: NavigationThemes[scheme].colors.border,
          position: 'absolute',
          backgroundColor: scheme === 'light' ? NavigationThemes[scheme].colors.card : 'transparent',
        },
        tabBarBackground: () => (scheme === 'light' ? null : <GlassSurface style={{ flex: 1 }} />),
        headerTitleStyle: { color: Palette.white },
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
            <Icon name={AppIcons.navigation.menu} color={scheme === 'light' ? Palette.white : Tokens[scheme].icon} />
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
          title: 'Home',
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
