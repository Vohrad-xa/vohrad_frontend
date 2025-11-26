import {useState, useCallback, useEffect} from 'react';
import {useOrganizationDetails, useUpdateTenant} from '../hooks';
import type {Tenant} from '@vohrad/types';

type StagedValues = Record<string, string>;

export function useOrganizationManager(isEditing: boolean) {
  const organization = useOrganizationDetails();
  const {updateTenantProfile, isLoading} = useUpdateTenant();
  const [stagedValues, setStagedValues] = useState<StagedValues>({});

  const handleFieldChange = (key: string, value: string) => {
    setStagedValues((prev) => ({...prev, [key]: value}));
  };

  const getAllFieldKeys = useCallback((): string[] => {
    if (!organization) return [];

    const businessKeys = ['telephone', 'website', 'industry', 'tax_id'];
    const addressKeys = [
      'street',
      'street_number',
      'city',
      'province',
      'postal_code',
      'country',
    ];
    const remarksKeys = organization.remarks ? ['remarks'] : [];

    return [...businessKeys, ...addressKeys, ...remarksKeys];
  }, [organization]);

  useEffect(() => {
    if (isEditing && organization) {
      const fieldKeys = getAllFieldKeys();
      const initialValues: StagedValues = {};
      fieldKeys.forEach((key) => {
        const value = organization[key as keyof Tenant];
        initialValues[key] = value?.toString() ?? '';
      });
      setStagedValues(initialValues);
    } else if (!isEditing) {
      setStagedValues({});
    }
  }, [isEditing, organization, getAllFieldKeys]);

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
    const updatedTenant = await updateTenantProfile(updateData);
    setStagedValues({});
    return updatedTenant;
  }, [getUpdateData, updateTenantProfile]);

  return {
    organization,
    isLoading,
    stagedValues,
    handleFieldChange,
    hasChanges,
    submitUpdate,
  };
}
