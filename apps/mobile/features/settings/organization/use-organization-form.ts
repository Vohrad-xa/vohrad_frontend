import {useState, useCallback, useMemo, useEffect} from 'react';
import {Platform} from 'react-native';
import {useOrganizationDetails, useUpdateTenant} from '@vohrad/store';
import type {InfoField} from '@/components/ui';
import type {Tenant} from '@vohrad/types';

type SectionKey = 'business' | 'address' | 'remarks';

type StagedValues = Record<string, string>;

export function useOrganizationForm(isEditing: boolean) {
  const organization = useOrganizationDetails();
  const {updateTenantProfile, isLoading} = useUpdateTenant();
  const [stagedValues, setStagedValues] = useState<StagedValues>({});

  const handleFieldChange = (key: string, value: string) => {
    setStagedValues((prev) => ({...prev, [key]: value}));
  };

  const getSectionFields = useCallback(
    (section: SectionKey): InfoField[] => {
      if (!organization) return [];

      switch (section) {
        case 'business':
          return [
            {
              key: 'telephone',
              label: 'Phone',
              value: organization?.telephone,
              span: 'half' as const,
            },
            {
              key: 'website',
              label: 'Website',
              value: organization?.website,
              span: 'half' as const,
            },
            {
              key: 'industry',
              label: 'Industry',
              value: organization?.industry,
              span: 'half' as const,
            },
            {
              key: 'tax_id',
              label: 'Tax ID',
              value: organization?.tax_id,
              span: 'half' as const,
            },
          ];
        case 'address':
          return [
            {
              key: 'street',
              label: 'Street',
              value: organization?.street,
              span: 'half' as const,
            },
            {
              key: 'street_number',
              label: 'Street Number',
              value: organization?.street_number,
              span: 'half' as const,
            },
            {
              key: 'city',
              label: 'City',
              value: organization?.city,
              span: 'half' as const,
            },
            {
              key: 'province',
              label: 'Province',
              value: organization?.province,
              span: 'half' as const,
            },
            {
              key: 'postal_code',
              label: 'Zip Code',
              value: organization?.postal_code,
              span: 'half' as const,
            },
            {
              key: 'country',
              label: 'Country',
              value: organization?.country,
              span: 'half' as const,
            },
          ];
        case 'remarks':
          return organization?.remarks
            ? [
                {
                  key: 'remarks',
                  label: 'Remarks',
                  value: organization.remarks,
                  span: 'full' as const,
                },
              ]
            : [];
        default:
          return [];
      }
    },
    [organization],
  );

  // Initialize all fields when entering edit mode or on web (always editable)
  useEffect(() => {
    if ((isEditing || Platform.OS === 'web') && organization) {
      const allFields = [
        ...getSectionFields('business'),
        ...getSectionFields('address'),
        ...getSectionFields('remarks'),
      ];
      const initialValues: StagedValues = {};
      allFields.forEach((field) => {
        initialValues[field.key] = field.value ?? '';
      });
      setStagedValues(initialValues);
    } else if (!isEditing && Platform.OS !== 'web') {
      setStagedValues({});
    }
  }, [isEditing, organization, getSectionFields]);

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

  const computeUpdateValue = useCallback(
    (key: string): string | null | undefined => {
      if (!(key in stagedValues)) {
        return undefined;
      }

      const currentValue = stagedValues[key]?.trim() ?? '';
      const originalValue =
        organization?.[key as keyof Tenant]?.toString().trim() ?? '';

      if (currentValue === originalValue) {
        return undefined;
      }

      if (currentValue.length === 0) {
        return originalValue.length > 0 ? null : undefined;
      }

      return currentValue;
    },
    [stagedValues, organization],
  );

  const hasChanges = useCallback(() => {
    const updateData: Record<string, string | null | undefined> = {};
    Object.keys(stagedValues).forEach((key) => {
      const value = computeUpdateValue(key);
      if (value !== undefined) {
        updateData[key] = value;
      }
    });

    return Object.values(updateData).some((value) => value !== undefined);
  }, [stagedValues, computeUpdateValue]);

  const getUpdateData = useCallback(() => {
    const updateData: Record<string, string | null | undefined> = {};
    Object.keys(stagedValues).forEach((key) => {
      const value = computeUpdateValue(key);
      if (value !== undefined) {
        updateData[key] = value;
      }
    });
    return updateData;
  }, [stagedValues, computeUpdateValue]);

  const submitUpdate = useCallback(async () => {
    const updateData = getUpdateData();
    await updateTenantProfile(updateData);
    setStagedValues({});
  }, [getUpdateData, updateTenantProfile]);

  return {
    organization,
    isLoading,
    stagedValues,
    businessFields,
    addressFields,
    remarksFields,
    handleFieldChange,
    hasChanges,
    submitUpdate,
  };
}
