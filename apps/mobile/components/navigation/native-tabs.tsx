import React from 'react';
import type {ComponentProps} from 'react';
import {Icon, NativeTabs, Label} from 'expo-router/unstable-native-tabs';
import {type ThemeShape} from '@/constants/theme';

type TabItem = {
  name: string;
  label: string;
  icon: string;
};

type NativeTabsComponentProps = {
  tabs: TabItem[];
  iosSFSymbols: Record<string, ComponentProps<typeof Icon>['sf']>;
  theme: ThemeShape;
};

export function NativeTabsComponent({
  tabs,
  iosSFSymbols,
  theme,
}: NativeTabsComponentProps) {
  return (
    <NativeTabs
      labelVisibilityMode="labeled"
      minimizeBehavior="onScrollDown"
      disableIndicator={false}
      backgroundColor={theme.navigationBar}
      tintColor={theme.tabIconSelected}
      indicatorColor={theme.card}
    >
      {tabs.map((tab) => (
        <NativeTabs.Trigger key={tab.name} name={tab.name}>
          <Label>{tab.label}</Label>
          <Icon sf={iosSFSymbols[tab.name]} />
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
