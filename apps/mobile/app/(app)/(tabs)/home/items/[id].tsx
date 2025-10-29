import {useCallback, useEffect, useState, useRef} from 'react';
import {Platform, Pressable, Text, View} from 'react-native';
import {useAuthStore} from '@vohrad/store';
import {useLocalSearchParams, useNavigation} from 'expo-router';
import {ThemedView, ModalScrollView, ThemedButton} from '@/components/ui';
import {
  ItemDetails,
  ItemHeader,
  useItemDetail,
  useItemForm,
} from '@/features/item';
import {useTheme, useHaptic} from '@/providers';
import {AppIcons, showAlert, Icon} from '@/utils';
import {useItemChanges} from '../_layout';

export default function ItemDetailScreen() {
  const {ds, theme} = useTheme();
  const navigation = useNavigation();
  const {id: itemId} = useLocalSearchParams<{id: string}>();
  const {hasChanges, setHasChanges} = useItemChanges();
  const {triggerHaptic} = useHaptic();
  const [showSuccess, setShowSuccess] = useState(false);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearError = useAuthStore((state) => state.clearError);

  const {item, isLoading, getItemImageUrl, error} = useItemDetail(itemId);

  // Form state management
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
      // Clear error after showing
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
      // Show success state
      triggerSuccess();
    } catch (_error) {
      // Error is handled by the store hook
      // No need to handle here - the store manages error state
    }
  }, [formState, triggerSuccess, triggerHaptic]);

  // Update header options based on changes
  useEffect(() => {
    if (hasChanges || showSuccess) {
      navigation.setOptions({
        headerRight: () =>
          Platform.OS === 'web' ? (
            <View style={{paddingHorizontal: ds.spacing.md}}>
              <ThemedButton
                title="Save"
                variant="primary"
                size="sm"
                onPress={showSuccess ? undefined : handleSave}
                disabled={!hasChanges && !showSuccess}
                icon={showSuccess ? AppIcons.actions.save : undefined}
                iconPosition="left"
              />
            </View>
          ) : (
            <Pressable
              onPress={handleSave}
              style={{
                paddingHorizontal: 20,
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 30,
                minWidth: ds.components.tapTarget.minSize,
              }}
              disabled={showSuccess}
            >
              {showSuccess ? (
                <Icon
                  name={AppIcons.actions.save}
                  size="xxl"
                  color={theme.accentGreen}
                />
              ) : (
                <Text style={{color: theme.text, fontSize: 17}}>Save</Text>
              )}
            </Pressable>
          ),
      });
    } else {
      navigation.setOptions({
        headerRight: undefined,
      });
    }
  }, [
    hasChanges,
    showSuccess,
    handleSave,
    navigation,
    theme.text,
    theme.accentGreen,
    ds.spacing.md,
    ds.components.tapTarget.minSize,
  ]);

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
