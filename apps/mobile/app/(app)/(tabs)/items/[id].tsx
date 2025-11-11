import React, {useState} from 'react';
import {useItemDetailManager} from '@vohrad/store';
import {useLocalSearchParams, useNavigation} from 'expo-router';
import {
  ModalScrollView,
  ThemedView,
  ThemedText,
  ThemedButton,
} from '@/components/ui';
import {ItemDetails, ItemHeader, useItemForm} from '@/features/item';
import {useSettingsHeader} from '@/hooks/use-settings-header';
import {useTheme, useHaptic} from '@/providers';
import {useItemChanges} from './_layout';

export default function ItemDetailScreen() {
  const {ds} = useTheme();
  const navigation = useNavigation();
  const {id: itemId} = useLocalSearchParams<{id: string}>();
  const {hasChanges, setHasChanges} = useItemChanges();
  const {triggerHaptic} = useHaptic();
  const [isEditing, setIsEditing] = useState(false);

  const {item, getItemImageUrl, isLoading, error} =
    useItemDetailManager(itemId);

  const formState = useItemForm({
    itemId: itemId!,
    initialValues: {
      name: item?.name ?? '',
      code: item?.code ?? '',
      serialNumber: item?.serial_number ?? '',
      description: item?.description ?? '',
      trackingMode: item?.tracking_mode,
      isActive: item?.is_active,
    },
    onHasChangesChange: setHasChanges,
  });

  const {triggerSuccess} = useSettingsHeader({
    navigation,
    isEditing,
    hasChanges,
    onSave: async () => {
      if (!isEditing && !hasChanges) {
        setIsEditing(true);
        return;
      }

      triggerHaptic('selection');
      try {
        await formState.performSave();
        setIsEditing(false);
        triggerSuccess();
      } catch {
        // Ignored, error is handled by mutation hook
      }
    },
    onCancel: () => {
      triggerHaptic('selection');
      formState.resetForm();
      setIsEditing(false);
    },
  });

  if (isLoading && !item) {
    return <ThemedView style={{flex: 1}} />;
  }

  if (error) {
    return (
      <ThemedView
        style={{flex: 1, justifyContent: 'center', padding: ds.spacing.lg}}
      >
        <ThemedText style={{textAlign: 'center', marginBottom: ds.spacing.md}}>
          {error.message}
        </ThemedText>
      </ThemedView>
    );
  }

  if (!item) {
    return (
      <ThemedView
        style={{flex: 1, justifyContent: 'center', padding: ds.spacing.lg}}
      >
        <ThemedText style={{textAlign: 'center', marginBottom: ds.spacing.md}}>
          Item not found.
        </ThemedText>
        <ThemedButton onPress={() => navigation.goBack()}>Go Back</ThemedButton>
      </ThemedView>
    );
  }

  return (
    <ModalScrollView contentContainerStyle={{gap: ds.spacing.xl}}>
      <ItemHeader item={item} imageUrl={getItemImageUrl()} />
      <ItemDetails
        quantity={item.total_quantity?.toString() ?? ''}
        formState={formState}
        itemId={itemId}
        isEditing={isEditing}
        item={item}
      />
    </ModalScrollView>
  );
}
