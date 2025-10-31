import React, {useState, useRef, useCallback} from 'react';
import {Platform} from 'react-native';
import {useItemDetailManager} from '@vohrad/store';
import {useRouter, useNavigation, useLocalSearchParams} from 'expo-router';
import {useSettingsHeader} from '@/hooks';
import {SpecificationsForm} from './specifications-form';

export function ItemSpecifications() {
  const router = useRouter();
  const navigation = useNavigation();
  const {id: itemId} = useLocalSearchParams<{id: string}>();
  const {item} = useItemDetailManager(itemId);
  const [hasChanges, setHasChanges] = useState(false);
  const [isEditMode, setIsEditMode] = useState(Platform.OS === 'web');
  const specificationsFormRef = useRef<{
    performSave: () => Promise<void>;
    isEditMode: boolean;
    toggleEditMode: () => void;
  }>(null);

  const handleClose = useCallback(() => {
    router.dismiss();
  }, [router]);

  const handleEditSave = useCallback(() => {
    if (isEditMode) {
      specificationsFormRef.current?.performSave();
    } else {
      specificationsFormRef.current?.toggleEditMode();
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
    />
  );
}
