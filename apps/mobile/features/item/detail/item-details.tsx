import React, {useCallback} from 'react';
import {View} from 'react-native';
import {Card} from '@/components/cards/card';
import {useTheme} from '@/providers';
import {BasicInfo} from './basic-info';
import {QuantityField} from './quantity-field';
import {Specifications} from './specifications/specifications';
import {StatusField} from './status-field';
import {TrackingModeField} from './tracking-mode-field';
import type {UseItemFormReturn} from '../hooks/use-item-form';

interface ItemDetailsProps {
  quantity?: string;
  formState: UseItemFormReturn;
  itemId?: string;
}

export function ItemDetails({
  quantity,
  formState,
  itemId,
}: ItemDetailsProps): React.JSX.Element {
  const {ds} = useTheme();

  const {
    formValues,
    optimisticStatus,
    optimisticTrackingMode,
    handleFieldChange,
    handleStatusChange,
    handleTrackingModeChange,
  } = formState;

  // Map form field changes to correct field names
  const handleBasicInfoChange = useCallback(
    (field: 'name' | 'code' | 'serial_number', value: string) => {
      // Map serial_number to serialNumber for form state
      const formField = field === 'serial_number' ? 'serialNumber' : field;
      handleFieldChange(formField as keyof typeof formValues, value);
    },
    [handleFieldChange],
  );

  return (
    <View style={{gap: ds.spacing.xl}}>
      {/* Basic Info */}
      <BasicInfo
        name={formValues.name}
        code={formValues.code}
        serialNumber={formValues.serialNumber}
        onFieldChange={handleBasicInfoChange}
      />

      {/* Status, Tracking Mode, and Quantity */}
      <Card withDivider>
        {/* Status field */}
        <StatusField
          key="status"
          isActive={optimisticStatus}
          onValueChange={handleStatusChange}
        />

        {/* Tracking mode field */}
        <TrackingModeField
          key="tracking-mode"
          trackingMode={optimisticTrackingMode}
          onValueChange={handleTrackingModeChange}
        />

        {/* Quantity field */}
        <QuantityField
          key="quantity"
          field={{key: 'quantity', label: 'Quantity', value: quantity ?? '0'}}
          value={quantity}
        />

        {/* Specifications field */}
        <Specifications key="specifications" itemId={itemId} />
      </Card>
    </View>
  );
}
