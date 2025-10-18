import {useState, useCallback, useMemo, useEffect} from 'react';
import {useOrganizationDetails, useUpdateTenant} from '@vohrad/store';
import type {Tenant} from '@vohrad/types';

type InfoField = {
  key: string;
  label: string;
  value?: string | null;
  placeholder?: string;
};

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
            {key: 'telephone', label: 'Phone', value: organization?.telephone},
            {key: 'website', label: 'Website', value: organization?.website},
            {key: 'industry', label: 'Industry', value: organization?.industry},
            {key: 'tax_id', label: 'Tax ID', value: organization?.tax_id},
          ];
        case 'address':
          return [
            {key: 'street', label: 'Street', value: organization?.street},
            {
              key: 'street_number',
              label: 'Street Number',
              value: organization?.street_number,
            },
            {key: 'city', label: 'City', value: organization?.city},
            {key: 'province', label: 'Province', value: organization?.province},
            {
              key: 'postal_code',
              label: 'Zip Code',
              value: organization?.postal_code,
            },
            {key: 'country', label: 'Country', value: organization?.country},
          ];
        case 'remarks':
          return organization?.remarks
            ? [{key: 'remarks', label: 'Remarks', value: organization.remarks}]
            : [];
        default:
          return [];
      }
    },
    [organization],
  );

  // Initialize all fields when entering edit mode
  useEffect(() => {
    if (isEditing && organization) {
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
    } else if (!isEditing) {
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
