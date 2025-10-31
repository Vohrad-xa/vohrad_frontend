import {useCallback, useEffect, useState, useRef} from 'react';
import {
  useAuthStore,
  useItemDetailManager,
  type StoreState,
} from '@vohrad/store';
import {useLocalSearchParams, useNavigation} from 'expo-router';
import {ThemedView, ModalScrollView, HeaderButton} from '@/components/ui';
import {ItemDetails, ItemHeader, useItemForm} from '@/features/item';
import {useTheme, useHaptic} from '@/providers';
import {showAlert} from '@/utils';
import {useItemChanges} from '../_layout';

export default function ItemDetailScreen() {
  const {ds} = useTheme();
  const navigation = useNavigation();
  const {id: itemId} = useLocalSearchParams<{id: string}>();
  const {hasChanges, setHasChanges} = useItemChanges();
  const {triggerHaptic} = useHaptic();
  const [showSuccess, setShowSuccess] = useState(false);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  // Clean up success timeout
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  const triggerSuccess = useCallback(() => {
    setShowSuccess(true);
    triggerHaptic('success');
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }
    successTimeoutRef.current = setTimeout(() => {
      setShowSuccess(false);
    }, 2000);
  }, [triggerHaptic]);

  const handleSave = useCallback(async () => {
    triggerHaptic('selection');
    try {
      await formState.performSave();
      triggerSuccess();
    } catch (_error) {
      // Error is handled by the store hook
    }
  }, [formState, triggerSuccess, triggerHaptic]);

  // Update header options
  useEffect(() => {
    if (hasChanges || showSuccess) {
      navigation.setOptions({
        headerRight: () =>
          showSuccess ? (
            <HeaderButton variant="success" accessibilityLabel="Saved" />
          ) : (
            <HeaderButton
              variant="save"
              text="Save"
              onPress={handleSave}
              accessibilityLabel="Save changes"
            />
          ),
      });
    } else {
      navigation.setOptions({
        headerRight: undefined,
      });
    }
  }, [hasChanges, showSuccess, handleSave, navigation]);

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
      />
    </ModalScrollView>
  );
}
