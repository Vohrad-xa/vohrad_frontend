import {useEffect, useState} from 'react';
import {
  useAuthStore,
  useItemDetailManager,
  type StoreState,
} from '@vohrad/store';
import {useLocalSearchParams, useNavigation} from 'expo-router';
import {ThemedView, ModalScrollView} from '@/components/ui';
import {ItemDetails, ItemHeader, useItemForm} from '@/features/item';
import {useSettingsHeader} from '@/hooks/use-settings-header';
import {useTheme, useHaptic} from '@/providers';
import {showAlert} from '@/utils';
import {useItemChanges} from './_layout';

export default function ItemDetailScreen() {
  const {ds} = useTheme();
  const navigation = useNavigation();
  const {id: itemId} = useLocalSearchParams<{id: string}>();
  const {hasChanges, setHasChanges} = useItemChanges();
  const {triggerHaptic} = useHaptic();
  const [isEditing, setIsEditing] = useState(false);
  const clearError = useAuthStore((state: StoreState) => state.clearError);
  const {item, isLoading, getItemImageUrl, error} =
    useItemDetailManager(itemId);

  const formState = useItemForm({
    itemId: itemId!,
    initialValues: {
      name: item?.name ?? '',
      code: item?.code ?? '',
      serialNumber: item?.serial_number ?? '',
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
      } catch (_error) {
        // Error is handled by the store hook
      }
    },
    onCancel: () => {
      triggerHaptic('selection');
      formState.resetForm();
      setIsEditing(false);
    },
  });

  // Show error alerts when errors occur
  useEffect(() => {
    if (error) {
      showAlert({
        title: 'Error',
        message: error,
      });
      clearError();
    }
  }, [error, clearError]);

  if (isLoading || !item) {
    return <ThemedView style={{flex: 1}} />;
  }

  return (
    <ModalScrollView contentContainerStyle={{gap: ds.spacing.xl}}>
      <ItemHeader item={item} imageUrl={getItemImageUrl()} />
      <ItemDetails
        quantity={item.total_quantity?.toString() ?? ''}
        formState={formState}
        itemId={itemId}
        isEditing={isEditing}
      />
    </ModalScrollView>
  );
}
