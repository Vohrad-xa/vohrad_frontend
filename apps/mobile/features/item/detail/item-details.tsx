import React, {useCallback} from 'react';
import {View} from 'react-native';
import {useRouter} from 'expo-router';
import {Card} from '@/components/cards/card';
import {useAttachmentNavigation} from '@/features/attachments';
import {useTheme} from '@/providers';
import {ActiveField} from './active-field';
import {AttachmentField} from './attachments/attachment-field';
import {BasicInfo} from './basic-info';
import {CategoryField} from './category-field';
import {DescriptionField} from './description-field';
import {Locations} from './locations/location-field';
import {QuantityField} from './quantity-field';
import {Specifications} from './specifications/specifications-field';
import {ItemStatusField} from './status-field';
import {TrackingModeField, useTrackingModePress} from './tracking-mode-field';
import type {UseItemFormReturn} from './use-item-form';
import type {ItemDetail} from '@sykamore/types';

interface ItemDetailsProps {
  quantity?: string;
  formState: UseItemFormReturn;
  itemId?: string;
  isEditing: boolean;
  item?: ItemDetail | null;
}

export function ItemDetails({
  quantity,
  formState,
  itemId,
  isEditing,
  item,
}: ItemDetailsProps): React.JSX.Element {
  const {ds} = useTheme();
  const router = useRouter();
  const {openVault, openVaultRoot} = useAttachmentNavigation();

  const {
    formValues,
    optimisticStatus,
    optimisticTrackingMode,
    handleFieldChange,
    handleStatusChange,
    handleTrackingModeChange,
  } = formState;

  const handleTrackingModePress = useTrackingModePress(
    optimisticTrackingMode,
    handleTrackingModeChange,
  );

  const handleBasicInfoChange = useCallback(
    (field: 'name' | 'sku', value: string) => {
      handleFieldChange(field, value);
    },
    [handleFieldChange],
  );

  const handleDescriptionChange = useCallback(
    (value: string) => {
      handleFieldChange('description', value);
    },
    [handleFieldChange],
  );

  return (
    <View style={{gap: ds.spacing.xl}}>
      {/* Basic Info */}
      <BasicInfo
        name={formValues.name}
        sku={formValues.sku}
        onFieldChange={handleBasicInfoChange}
        isEditing={isEditing}
      />

      {/* Status and Quantity */}
      <Card>
        <ActiveField
          key="active"
          isActive={optimisticStatus}
          onValueChange={handleStatusChange}
        />
        <Card.Divider />
        <QuantityField
          key="quantity"
          field={{key: 'quantity', label: 'Quantity', value: quantity ?? '0'}}
          value={quantity}
        />
        <Card.Divider />
        <ItemStatusField key="status" status={item?.status} />
      </Card>

      <Card>
        {/* Category field */}
        <Card.Row onPress={() => {}} accessibilityLabel="View category">
          <CategoryField key="category" category={item?.category} />
        </Card.Row>
        <Card.Divider />

        {/* Tracking mode field */}
        <Card.Row
          onPress={handleTrackingModePress}
          accessibilityLabel="Select tracking mode"
        >
          <TrackingModeField
            key="tracking-mode"
            trackingMode={optimisticTrackingMode}
            onValueChange={handleTrackingModeChange}
          />
        </Card.Row>
        <Card.Divider />

        {/* Specifications field */}
        <Card.Row
          onPress={() => {
            router.push({
              pathname: '/items/specifications',
              params: {itemData: JSON.stringify(item)},
            });
          }}
          accessibilityLabel="View specifications"
        >
          <Specifications key="specifications" />
        </Card.Row>
        <Card.Divider />

        {/* Attachments field */}
        <Card.Row
          onPress={() => {
            if (itemId) {
              openVault({
                targetType: 'item',
                targetId: itemId,
                itemName: item?.name,
              });
              return;
            }

            openVaultRoot();
          }}
          accessibilityLabel="View attachments"
        >
          <AttachmentField key="attachments" itemId={itemId} />
        </Card.Row>
        <Card.Divider />
        {/* Locations field */}
        <Card.Row
          onPress={() => {
            router.push({
              pathname: '/items/location',
              params: {id: itemId, itemData: JSON.stringify(item)},
            });
          }}
          accessibilityLabel="View locations"
        >
          <Locations key="locations" itemId={itemId} item={item ?? undefined} />
        </Card.Row>
      </Card>

      {/* Description */}
      <DescriptionField
        value={formValues.description}
        onChange={handleDescriptionChange}
        isEditing={isEditing}
      />
    </View>
  );
}
