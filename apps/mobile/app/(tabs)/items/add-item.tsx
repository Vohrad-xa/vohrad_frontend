import {useCallback, useLayoutEffect, useRef, useState} from 'react';
import {router, useNavigation} from 'expo-router';
import {AddItemScreen} from '@/features/item';
import type {AddItemScreenHandle} from '@/features/item/views/add-item';
import {AppIcons} from '@/utils/icons';
import {getHeaderOptions, type HeaderButtonAction} from '@/utils/navigation';

export default function AddItemModal() {
  const navigation = useNavigation();
  const screenRef = useRef<AddItemScreenHandle>(null);
  const [canSave, setCanSave] = useState(false);

  const handleSave = useCallback(async () => {
    await screenRef.current?.save();
  }, []);

  useLayoutEffect(() => {
    const cancelAction: HeaderButtonAction = {
      type: 'button',
      key: 'cancel-item',
      label: 'Cancel',
      onPress: () => router.dismiss(),
      accessibilityLabel: 'Cancel',
    };

    const saveAction: HeaderButtonAction = {
      type: 'button',
      key: 'save-item',
      label: 'Save',
      iosSymbol: AppIcons.actions.save,
      variant: 'done',
      disabled: !canSave,
      onPress: () => {
        void handleSave();
      },
      accessibilityLabel: 'Save new item',
    };

    navigation.setOptions(
      getHeaderOptions({left: [cancelAction], right: [saveAction]}),
    );
  }, [navigation, canSave, handleSave]);

  return (
    <AddItemScreen
      ref={screenRef}
      onSaveComplete={() => router.dismiss()}
      onCanSaveChange={setCanSave}
    />
  );
}
