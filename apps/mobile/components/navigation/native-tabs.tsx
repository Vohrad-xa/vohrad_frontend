import React from 'react';
import {Icon, NativeTabs, Label} from 'expo-router/unstable-native-tabs';
import {type ThemeShape} from '@/constants/theme';
import type {SFSymbol} from 'sf-symbols-typescript';

type TabItem = {
  name: string;
  label: string;
  icon: string;
};

type NativeTabsComponentProps = {
  tabs: TabItem[];
  theme: ThemeShape;
};

export function NativeTabsComponent({tabs}: NativeTabsComponentProps) {
  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      blurEffect="systemMaterial"
      labelVisibilityMode="labeled"
    >
      {tabs.map((tab) => (
        <NativeTabs.Trigger key={tab.name} name={tab.name}>
          <Label>{tab.label}</Label>
          <Icon sf={tab.icon as SFSymbol} />
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
