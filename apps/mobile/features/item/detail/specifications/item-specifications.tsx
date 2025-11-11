import React, {useState, useRef, useCallback} from 'react';
import {useRouter, useNavigation, useLocalSearchParams} from 'expo-router';
import {useSettingsHeader} from '@/hooks';
import {SpecificationsForm} from './specifications-form';

export function ItemSpecifications() {
  const router = useRouter();
  const navigation = useNavigation();
  const {itemData} = useLocalSearchParams<{itemData?: string}>();
  const item = JSON.parse(itemData!);
  const [hasChanges, setHasChanges] = useState(false);
  const [isEditMode, setIsEditMode] = useState(
    !item.specifications || Object.keys(item.specifications).length === 0,
  );
  const specificationsFormRef = useRef<{
    performSave: () => Promise<void>;
  }>(null);

  const handleClose = useCallback(() => {
    router.dismiss();
  }, [router]);

  const handleEditSave = useCallback(async () => {
    if (isEditMode) {
      await specificationsFormRef.current?.performSave();
    } else {
      setIsEditMode(true);
    }
  }, [isEditMode]);

  const {triggerSuccess} = useSettingsHeader({
    navigation,
    isEditing: isEditMode,
    hasChanges,
    onSave: handleEditSave,
    onClose: handleClose,
  });

  const handleSaveComplete = useCallback(() => {
    setIsEditMode(false);
    setHasChanges(false);
    triggerSuccess();
  }, [triggerSuccess]);

  if (!item) {
    return null;
  }

  return (
    <SpecificationsForm
      ref={specificationsFormRef}
      item={item}
      onHasChangesChange={setHasChanges}
      onSave={handleSaveComplete}
      isEditMode={isEditMode}
    />
  );
}
