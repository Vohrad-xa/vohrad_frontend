import React, {forwardRef, useImperativeHandle, useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import {InfoRowCard, EmptyState} from '@/components/ui';
import type {InfoField} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';
import {useOrganization} from '../hooks';

export type BusinessDetailsContentHandle = {
  saveOrganization: () => void;
  hasChanges: () => boolean;
};

type BusinessDetailsContentProps = {
  isEditing: boolean;
  onSaveComplete?: () => void;
  onFieldChange?: () => void;
};

export const BusinessDetailsContent = forwardRef<
  BusinessDetailsContentHandle,
  BusinessDetailsContentProps
>(({isEditing, onSaveComplete, onFieldChange}, ref) => {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);

  const {
    organization,
    stagedValues,
    handleFieldChange,
    hasChanges,
    saveOrganization,
  } = useOrganization(isEditing);

  const handleSave = async () => {
    const result = await saveOrganization();
    if (result) {
      onSaveComplete?.();
    }
  };

  useImperativeHandle(ref, () => ({
    saveOrganization: handleSave,
    hasChanges,
  }));

  useEffect(() => {
    if (Object.keys(stagedValues).length > 0) {
      onFieldChange?.();
    }
  }, [stagedValues, onFieldChange]);

  if (!organization) {
    return <EmptyState message="No organization information available" />;
  }

  const allFields: InfoField[] = [
    // Business Details
    {
      key: 'telephone',
      label: 'Phone',
      value: organization.telephone,
      span: 'half' as const,
    },
    {
      key: 'website',
      label: 'Website',
      value: organization.website,
      span: 'half' as const,
    },
    {
      key: 'industry',
      label: 'Industry',
      value: organization.industry,
      span: 'half' as const,
    },
    {
      key: 'tax_id',
      label: 'Tax ID',
      value: organization.tax_id,
      span: 'half' as const,
    },
    // Address
    {
      key: 'street',
      label: 'Street',
      value: organization.street,
      span: 'half' as const,
    },
    {
      key: 'street_number',
      label: 'Street Number',
      value: organization.street_number,
      span: 'half' as const,
    },
    {
      key: 'city',
      label: 'City',
      value: organization.city,
      span: 'half' as const,
    },
    {
      key: 'province',
      label: 'Province',
      value: organization.province,
      span: 'half' as const,
    },
    {
      key: 'postal_code',
      label: 'Zip Code',
      value: organization.postal_code,
      span: 'half' as const,
    },
    {
      key: 'country',
      label: 'Country',
      value: organization.country,
      span: 'half' as const,
    },
    // Remarks (if exists)
    ...(organization.remarks
      ? [
          {
            key: 'remarks',
            label: 'Remarks',
            value: organization.remarks,
            span: 'full' as const,
          },
        ]
      : []),
  ];

  return (
    <View style={styles.container}>
      <InfoRowCard
        fields={allFields}
        editable={isEditing}
        values={stagedValues}
        onFieldChange={handleFieldChange}
        autoFocus
      />
    </View>
  );
});

BusinessDetailsContent.displayName = 'BusinessDetailsContent';

const createStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        gap: ds.spacing.md,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
