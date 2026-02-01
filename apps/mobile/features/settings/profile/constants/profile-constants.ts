import type {Href} from 'expo-router';

export const PROFILE_FIELDS = {
  name: {
    title: 'Name',
    href: '/(tabs)/settings/profile/name' satisfies Href,
    a11yLabel: 'Name',
    a11yHint: 'Opens the name editor',
  },
  dateOfBirth: {
    title: 'Date of Birth',
    href: '/(tabs)/settings/profile/birth-date' satisfies Href,
    a11yLabel: 'Date of Birth',
    a11yHint: 'Opens the date picker',
  },
  email: {
    title: 'Email',
    href: '/(tabs)/settings/profile/email' satisfies Href,
    a11yLabel: 'Email',
    a11yHint: 'Opens the email editor',
  },
  phoneNumber: {
    title: 'Phone Number',
    href: '/(tabs)/settings/profile/phone' satisfies Href,
    a11yLabel: 'Phone number',
    a11yHint: 'Opens the phone number editor',
  },
  password: {
    title: 'Password',
    href: '/(tabs)/settings/profile/password' satisfies Href,
    a11yLabel: 'Change password',
    a11yHint: 'Opens the password change screen',
  },
  address: {
    title: 'Address',
    href: '/(tabs)/settings/profile/address' satisfies Href,
    a11yLabel: 'Address',
    a11yHint: 'Opens the address editor',
  },
} as const;
