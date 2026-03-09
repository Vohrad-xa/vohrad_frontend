import {useMemo} from 'react';
import {useTenantManager} from '@sykamore/store';

/**
 * Provides computed tenant details.
 */
export function useTenantDetails() {
  const {tenant} = useTenantManager();

  const title = tenant?.name ?? 'Organization';
  const subtitle = tenant?.email ?? '';

  const avatarLabel = useMemo(() => title.slice(0, 2).toUpperCase(), [title]);

  return {
    tenant,
    title,
    subtitle,
    avatarLabel,
    name: tenant?.name ?? '',
    email: tenant?.email ?? '',
    phone: tenant?.telephone ?? '',
    website: tenant?.website ?? '',
    street: tenant?.street ?? '',
    streetNumber: tenant?.street_number ?? '',
    city: tenant?.city ?? '',
    province: tenant?.province ?? '',
    postalCode: tenant?.postal_code ?? '',
    country: tenant?.country ?? '',
    industry: tenant?.industry ?? '',
    taxId: tenant?.tax_id ?? '',
  };
}
