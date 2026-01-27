import {useCallback, useEffect, useMemo, useState} from 'react';
import {useUpdateTenant} from '@sykamore/store';
import type {TenantProfileUpdate} from '@sykamore/types';
import {showAlert} from '@/utils';
import {useBusinessDetails} from './use-business-details';

type OrganizationInfoValues = {
  name: string;
  email: string;
  phone: string;
  website: string;
  street: string;
  streetNumber: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
};

function normalizeValue(value: string | null | undefined) {
  return value?.toString().trim() ?? '';
}

function computeUpdateValue(currentValue: string, originalValue: string) {
  const current = currentValue.trim();
  const original = originalValue.trim();

  if (current === original) return undefined;
  if (current.length === 0) return original.length > 0 ? null : undefined;

  return current;
}

export function useOrganizationInfoForm() {
  const {
    organization,
    name,
    email,
    phone,
    website,
    street,
    streetNumber,
    city,
    province,
    postalCode,
    country,
  } = useBusinessDetails();
  const {updateTenantProfile, isLoading} = useUpdateTenant();

  const initialValues = useMemo<OrganizationInfoValues>(
    () => ({
      name,
      email,
      phone,
      website,
      street,
      streetNumber,
      city,
      province,
      postalCode,
      country,
    }),
    [
      name,
      email,
      phone,
      website,
      street,
      streetNumber,
      city,
      province,
      postalCode,
      country,
    ],
  );

  const [values, setValues] = useState<OrganizationInfoValues>(initialValues);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const handleFieldChange = useCallback(
    (key: keyof OrganizationInfoValues, value: string) => {
      setValues((prev) => ({...prev, [key]: value}));
    },
    [],
  );

  const buildUpdateData = useCallback(() => {
    const updateData: TenantProfileUpdate = {};

    const telephone = computeUpdateValue(
      values.phone,
      normalizeValue(organization?.telephone),
    );
    if (telephone !== undefined) updateData.telephone = telephone;

    const websiteValue = computeUpdateValue(
      values.website,
      normalizeValue(organization?.website),
    );
    if (websiteValue !== undefined) updateData.website = websiteValue;

    const streetValue = computeUpdateValue(
      values.street,
      normalizeValue(organization?.street),
    );
    if (streetValue !== undefined) updateData.street = streetValue;

    const streetNumberValue = computeUpdateValue(
      values.streetNumber,
      normalizeValue(organization?.street_number),
    );
    if (streetNumberValue !== undefined) {
      updateData.street_number = streetNumberValue;
    }

    const cityValue = computeUpdateValue(
      values.city,
      normalizeValue(organization?.city),
    );
    if (cityValue !== undefined) updateData.city = cityValue;

    const provinceValue = computeUpdateValue(
      values.province,
      normalizeValue(organization?.province),
    );
    if (provinceValue !== undefined) updateData.province = provinceValue;

    const postalCodeValue = computeUpdateValue(
      values.postalCode,
      normalizeValue(organization?.postal_code),
    );
    if (postalCodeValue !== undefined) updateData.postal_code = postalCodeValue;

    const countryValue = computeUpdateValue(
      values.country,
      normalizeValue(organization?.country),
    );
    if (countryValue !== undefined) updateData.country = countryValue;

    return updateData;
  }, [organization, values]);

  const hasChanges = useMemo(() => {
    const updateData = buildUpdateData();
    return Object.keys(updateData).length > 0;
  }, [buildUpdateData]);

  const save = useCallback(async () => {
    const updateData = buildUpdateData();

    if (Object.keys(updateData).length === 0) {
      showAlert({
        title: 'No Changes Detected',
        message: 'Update a field before saving your organization.',
      });
      return false;
    }

    await updateTenantProfile(updateData);
    return true;
  }, [buildUpdateData, updateTenantProfile]);

  return {
    values,
    handleFieldChange,
    hasChanges,
    isSaving: isLoading,
    save,
  };
}
