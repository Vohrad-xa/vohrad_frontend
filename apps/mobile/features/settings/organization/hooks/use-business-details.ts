import {useMemo} from 'react';
import {useTenantManager} from '@sykamore/store';

/**
 * Provides computed organization/tenant details.
 */
export function useBusinessDetails() {
  const {tenant: organization} = useTenantManager();

  const title = organization?.sub_domain ?? 'Organization';
  const subtitle = organization?.email ?? '';

  const avatarLabel = useMemo(() => title.slice(0, 2).toUpperCase(), [title]);

  return {
    organization,
    title,
    subtitle,
    avatarLabel,
    name: organization?.sub_domain ?? '',
    email: organization?.email ?? '',
    phone: organization?.telephone ?? '',
    website: organization?.website ?? '',
    street: organization?.street ?? '',
    streetNumber: organization?.street_number ?? '',
    city: organization?.city ?? '',
    province: organization?.province ?? '',
    postalCode: organization?.postal_code ?? '',
    country: organization?.country ?? '',
  };
}
