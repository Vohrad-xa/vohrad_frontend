import {useMemo} from 'react';
import {router} from 'expo-router';
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
          router.push('/settings/profile');
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
          router.push('/settings/preferences');
        },
      },
      {
        id: 'language',
        icon: AppIcons.content.language,
        label: 'App Language',
        onPress: () => {
          router.push('/settings/language');
        },
      },
      {
        id: 'support',
        icon: AppIcons.status.help,
        label: 'Report an Issue',
        showDividerAfter: true,
        onPress: () => {
          router.push('/settings/support');
        },
      },
      {
        id: 'organization',
        icon: AppIcons.business.organization,
        label: 'Organization',
        onPress: () => {
          router.push('/settings/organization');
        },
      },
      {
        id: 'plan',
        icon: AppIcons.business.plan,
        label: 'Plan',
        showDividerAfter: true,
        onPress: () => {
          router.push('/settings/plan');
        },
      },
      {
        id: 'privacy',
        icon: AppIcons.content.privacy,
        label: 'Privacy Policy',
        onPress: () => {
          router.push('/settings/privacy');
        },
      },
      {
        id: 'terms',
        icon: AppIcons.content.document,
        label: 'Terms of Use',
        onPress: () => {
          router.push('/settings/terms');
        },
      },
      {
        id: 'about',
        icon: AppIcons.status.info,
        label: 'About',
        onPress: () => {
          router.push('/settings/about');
        },
      },
    ],
    [scheme],
  );

  return computedSettingsItems;
}
