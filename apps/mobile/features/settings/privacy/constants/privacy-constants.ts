import type {TokenName} from '@/constants';
import {AppIcons, type IconName} from '@/utils';
import type {Href} from 'expo-router';

export type PrivacyRow = Readonly<{
  rowKey: string;
  title: string;
  description: string;
  href?: Href;
  icon?: IconName;
  iconColorToken?: TokenName;
  a11yLabel?: string;
  a11yHint?: string;
}>;

export const PRIVACY_HEADER = {
  title: 'Your Privacy Matters',
  description:
    'Sykamore is committed to protecting your data and privacy. Here you can manage your settings and learn more about our practices.',
} as const;

export const PRIVACY_SECURITY_ROWS = [
  {
    rowKey: 'two-step-verification',
    title: 'Two-Step Verification',
    description: 'Add a second step at sign in.',
    icon: AppIcons.ui.privacy,
    iconColorToken: 'accentOrange',
  },
  {
    rowKey: 'passkeys',
    title: 'PassKeys',
    description: 'Use passkeys on supported devices.',
    icon: AppIcons.ui.preference,
    iconColorToken: 'accentIndigo',
  },
  {
    rowKey: 'passcode-face-id',
    title: 'Passcode & Face ID',
    description: 'Manage biometric access.',
    icon: AppIcons.ui.biometric,
    iconColorToken: 'accentGreen',
    a11yLabel: 'Passcode and Face ID',
    a11yHint: 'Manage your passcode and biometric settings',
  },
] as const satisfies readonly PrivacyRow[];

export const PRIVACY_ACCOUNT_ROWS = [
  {
    rowKey: 'active-sessions',
    title: 'Active Sessions',
    description: 'See where your account is signed in.',
    icon: AppIcons.ui.userManagement,
    iconColorToken: 'accentTeal',
  },
  {
    rowKey: 'password',
    title: 'Password',
    description: 'Change your password.',
    icon: AppIcons.ui.preference,
    iconColorToken: 'accentRed',
  },
] as const satisfies readonly PrivacyRow[];

export const PRIVACY_LEGAL_ROWS = [
  {
    rowKey: 'download-my-data',
    title: 'Download My Data',
    description: 'Request a copy of your data.',
    icon: AppIcons.actions.download,
    iconColorToken: 'accentBlue',
    a11yLabel: 'Download My Data',
    a11yHint: 'Request a copy of your personal data',
  },
  {
    rowKey: 'privacy-policy',
    title: 'Privacy Policy',
    description: 'See how your data is used.',
    icon: AppIcons.ui.terms,
    iconColorToken: 'accentPurple',
    a11yLabel: 'Privacy Policy',
    a11yHint: 'View the full privacy policy',
  },
] as const satisfies readonly PrivacyRow[];
