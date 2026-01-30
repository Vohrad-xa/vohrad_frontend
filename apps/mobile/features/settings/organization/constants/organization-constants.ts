import type {Href} from 'expo-router';

export const TENANT_FIELDS = {
  info: {
    title: 'Organization info',
    description: 'Name, email, phone, address',
    href: '/(app)/(tabs)/settings/organization/organization-info' satisfies Href,
  },
  license: {
    title: 'License & Billing',
    description: 'Plan, payment method',
    href: '/(app)/(tabs)/settings/organization/license' satisfies Href,
  },
  businessHours: {
    title: 'Business hours',
    description: 'Set your business hours',
    href: '/(app)/(tabs)/settings/organization/business-hours' satisfies Href,
  },
} as const;
