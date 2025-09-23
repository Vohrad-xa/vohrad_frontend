import {useMemo} from 'react';
import {useTheme} from '@/providers';
import {AppIcons} from '@/utils';
import type {SettingsItem, ToggleSettingsItem} from './types';

export function useSettingsItems() {
  const {scheme} = useTheme();

  const computedSettingsItems: Array<SettingsItem | ToggleSettingsItem> = useMemo(
    () => [
      {
        id: 'profile',
        icon: AppIcons.business.profile,
        label: 'Profile',
        showDividerAfter: true,
        onPress: () => {
          // TODO: Navigate to profile screen
        },
      },
      {
        id: 'appearance',
        icon: scheme === 'dark' ? AppIcons.theme.light : AppIcons.theme.dark,
        label: 'Appearance',
        hasToggle: true,
      },
      {
        id: 'preferences',
        icon: AppIcons.navigation.settings,
        label: 'Preferences',
        onPress: () => {
          // TODO: Navigate to preferences screen
        },
      },
      {
        id: 'language',
        icon: AppIcons.content.language,
        label: 'App Language',
        onPress: () => {
          // TODO: Navigate to language selection screen
        },
      },
      {
        id: 'support',
        icon: AppIcons.status.help,
        label: 'Report an Issue',
        showDividerAfter: true,
        onPress: () => {
          // TODO: Navigate to support screen
        },
      },
      {
        id: 'organization',
        icon: AppIcons.business.organization,
        label: 'Organization',
        onPress: () => {
          // TODO: Navigate to organization screen
        },
      },
      {
        id: 'plan',
        icon: AppIcons.business.plan,
        label: 'Plan',
        showDividerAfter: true,
        onPress: () => {
          // TODO: Navigate to plan screen
        },
      },
      {
        id: 'privacy',
        icon: AppIcons.content.privacy,
        label: 'Privacy Policy',
        onPress: () => {
          // TODO: Navigate to privacy policy screen
        },
      },
      {
        id: 'terms',
        icon: AppIcons.content.document,
        label: 'Terms of Use',
        onPress: () => {
          // TODO: Navigate to terms of use screen
        },
      },
      {
        id: 'about',
        icon: AppIcons.status.info,
        label: 'About',
        onPress: () => {
          // TODO: Navigate to about screen
        },
      },
    ],
    [scheme],
  );

  return computedSettingsItems;
}
