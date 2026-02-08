import type {Href} from 'expo-router';

export const TENANT_FIELDS = {
  info: {
    title: 'Organization info',
    description: 'Name, email, phone, address',
    href: '/(tabs)/settings/tenant/tenant-info' satisfies Href,
    a11yLabel: 'Organization info',
    a11yHint: 'View organization details',
  },
  license: {
    title: 'License & Billing',
    description: 'Plan, payment method',
    href: '/(tabs)/settings/tenant/license' satisfies Href,
    a11yLabel: 'License & Billing',
    a11yHint: 'View plan and payment details',
  },
  businessHours: {
    title: 'Business hours',
    description: 'Set your business hours',
    href: '/(tabs)/settings/tenant/business-hours' satisfies Href,
    a11yLabel: 'Business hours',
    a11yHint: 'View and edit business hours',
  },
  users: {
    title: 'Users',
    description: 'Manage organization users',
    href: '/(tabs)/settings/tenant/users' satisfies Href,
    a11yLabel: 'Users',
    a11yHint: 'Manage organization users',
  },
} as const;
