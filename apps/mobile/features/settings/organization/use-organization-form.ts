import {useCallback, useMemo} from 'react';
import {Platform} from 'react-native';
import {useOrganizationManager} from '@vohrad/store';
import type {InfoField} from '@/components/ui';

type SectionKey = 'business' | 'address' | 'remarks';

export function useOrganizationForm(isEditing: boolean) {
  const isAlwaysEditing = Platform.OS === 'web' ? true : isEditing;
  const manager = useOrganizationManager(isAlwaysEditing);

  const getSectionFields = useCallback(
    (section: SectionKey): InfoField[] => {
      if (!manager.organization) return [];

      switch (section) {
        case 'business':
          return [
            {
              key: 'telephone',
              label: 'Phone',
              value: manager.organization?.telephone,
              span: 'half' as const,
            },
            {
              key: 'website',
              label: 'Website',
              value: manager.organization?.website,
              span: 'half' as const,
            },
            {
              key: 'industry',
              label: 'Industry',
              value: manager.organization?.industry,
              span: 'half' as const,
            },
            {
              key: 'tax_id',
              label: 'Tax ID',
              value: manager.organization?.tax_id,
              span: 'half' as const,
            },
          ];
        case 'address':
          return [
            {
              key: 'street',
              label: 'Street',
              value: manager.organization?.street,
              span: 'half' as const,
            },
            {
              key: 'street_number',
              label: 'Street Number',
              value: manager.organization?.street_number,
              span: 'half' as const,
            },
            {
              key: 'city',
              label: 'City',
              value: manager.organization?.city,
              span: 'half' as const,
            },
            {
              key: 'province',
              label: 'Province',
              value: manager.organization?.province,
              span: 'half' as const,
            },
            {
              key: 'postal_code',
              label: 'Zip Code',
              value: manager.organization?.postal_code,
              span: 'half' as const,
            },
            {
              key: 'country',
              label: 'Country',
              value: manager.organization?.country,
              span: 'half' as const,
            },
          ];
        case 'remarks':
          return manager.organization?.remarks
            ? [
                {
                  key: 'remarks',
                  label: 'Remarks',
                  value: manager.organization.remarks,
                  span: 'full' as const,
                },
              ]
            : [];
        default:
          return [];
      }
    },
    [manager.organization],
  );

  const businessFields = useMemo(
    () => getSectionFields('business'),
    [getSectionFields],
  );
  const addressFields = useMemo(
    () => getSectionFields('address'),
    [getSectionFields],
  );
  const remarksFields = useMemo(
    () => getSectionFields('remarks'),
    [getSectionFields],
  );

  return {
    ...manager,
    businessFields,
    addressFields,
    remarksFields,
  };
}
