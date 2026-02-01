import type {Href} from 'expo-router';

export const TENANT_FIELDS = {
  info: {
    title: 'Organization info',
    description: 'Name, email, phone, address',
    href: '/(tabs)/settings/tenant/tenant-info' satisfies Href,
  },
  license: {
    title: 'License & Billing',
    description: 'Plan, payment method',
    href: '/(tabs)/settings/tenant/license' satisfies Href,
  },
  businessHours: {
    title: 'Business hours',
    description: 'Set your business hours',
    href: '/(tabs)/settings/tenant/business-hours' satisfies Href,
  },
  users: {
    title: 'Users',
    description: 'Manage organization users',
    href: '/(tabs)/settings/tenant/users' satisfies Href,
  },
} as const;
