import {useCallback, useEffect, useMemo, useState} from 'react';
import {useUpdateTenantProfile} from '@sykamore/store';
import {useTenantDetails} from './use-tenant-details';
import type {TenantProfileUpdate} from '@sykamore/types';

type TenantInfoValues = {
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
  industry: string;
  taxId: string;
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

export function useTenantInfoForm() {
  const {
    tenant,
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
    industry,
    taxId,
  } = useTenantDetails();
  const {mutateAsync: updateTenantProfile, isPending: isLoading} =
    useUpdateTenantProfile();

  const initialValues = useMemo<TenantInfoValues>(
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
      industry,
      taxId,
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
      industry,
      taxId,
    ],
  );

  const [values, setValues] = useState<TenantInfoValues>(initialValues);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const handleFieldChange = useCallback(
    (key: keyof TenantInfoValues, value: string) => {
      setValues((prev) => ({...prev, [key]: value}));
    },
    [],
  );

  const buildUpdateData = useCallback(() => {
    const updateData: TenantProfileUpdate = {};

    const telephone = computeUpdateValue(
      values.phone,
      normalizeValue(tenant?.telephone),
    );
    if (telephone !== undefined) updateData.telephone = telephone;

    const websiteValue = computeUpdateValue(
      values.website,
      normalizeValue(tenant?.website),
    );
    if (websiteValue !== undefined) updateData.website = websiteValue;

    const streetValue = computeUpdateValue(
      values.street,
      normalizeValue(tenant?.street),
    );
    if (streetValue !== undefined) updateData.street = streetValue;

    const streetNumberValue = computeUpdateValue(
      values.streetNumber,
      normalizeValue(tenant?.street_number),
    );
    if (streetNumberValue !== undefined) {
      updateData.street_number = streetNumberValue;
    }

    const cityValue = computeUpdateValue(
      values.city,
      normalizeValue(tenant?.city),
    );
    if (cityValue !== undefined) updateData.city = cityValue;

    const provinceValue = computeUpdateValue(
      values.province,
      normalizeValue(tenant?.province),
    );
    if (provinceValue !== undefined) updateData.province = provinceValue;

    const postalCodeValue = computeUpdateValue(
      values.postalCode,
      normalizeValue(tenant?.postal_code),
    );
    if (postalCodeValue !== undefined) updateData.postal_code = postalCodeValue;

    const countryValue = computeUpdateValue(
      values.country,
      normalizeValue(tenant?.country),
    );
    if (countryValue !== undefined) updateData.country = countryValue;

    const industryValue = computeUpdateValue(
      values.industry,
      normalizeValue(tenant?.industry),
    );
    if (industryValue !== undefined) updateData.industry = industryValue;

    const taxIdValue = computeUpdateValue(
      values.taxId,
      normalizeValue(tenant?.tax_id),
    );
    if (taxIdValue !== undefined) updateData.tax_id = taxIdValue;

    return updateData;
  }, [tenant, values]);

  const getChangedFieldLabels = useCallback(() => {
    const fields: Array<{
      key: keyof TenantInfoValues;
      label: string;
      original: string | null | undefined;
    }> = [
      {key: 'phone', label: 'Phone', original: tenant?.telephone},
      {key: 'website', label: 'Website', original: tenant?.website},
      {key: 'street', label: 'Street', original: tenant?.street},
      {
        key: 'streetNumber',
        label: 'Street Number',
        original: tenant?.street_number,
      },
      {key: 'city', label: 'City', original: tenant?.city},
      {key: 'province', label: 'Province', original: tenant?.province},
      {
        key: 'postalCode',
        label: 'Postal Code',
        original: tenant?.postal_code,
      },
      {key: 'country', label: 'Country', original: tenant?.country},
      {key: 'industry', label: 'Industry', original: tenant?.industry},
      {key: 'taxId', label: 'Tax ID', original: tenant?.tax_id},
    ];

    return fields
      .filter(({key, original}) => {
        const value = values[key];
        return (
          computeUpdateValue(value, normalizeValue(original)) !== undefined
        );
      })
      .map(({label}) => label);
  }, [tenant, values]);

  const hasChanges = useMemo(() => {
    const labels = getChangedFieldLabels();
    return labels.length > 0;
  }, [getChangedFieldLabels]);

  const save = useCallback(async () => {
    const updateData = buildUpdateData();
    const changedLabels = getChangedFieldLabels();

    if (Object.keys(updateData).length === 0) {
      return null;
    }

    await updateTenantProfile(updateData);
    return changedLabels;
  }, [buildUpdateData, getChangedFieldLabels, updateTenantProfile]);

  return {
    values,
    handleFieldChange,
    hasChanges,
    isSaving: isLoading,
    save,
  };
}
