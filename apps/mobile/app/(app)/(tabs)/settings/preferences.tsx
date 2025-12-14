import React, {useRef, useCallback} from 'react';
import {useNavigation} from 'expo-router';
import {ModalScrollView} from '@/components/ui';
import {
  PreferencesContent,
  type PreferencesContentHandle,
} from '@/features/settings';
import {useSettingsHeader} from '@/hooks';

export default function PreferencesScreen() {
  const navigation = useNavigation();
  const preferencesContentRef = useRef<PreferencesContentHandle>(null);

  const handleSave = useCallback(() => {
    preferencesContentRef.current?.savePreferences();
  }, []);

  const {triggerSuccess} = useSettingsHeader({
    navigation,
    isEditing: true,
    onSave: handleSave,
  });

  const handleSaveComplete = useCallback(() => {
    triggerSuccess();
  }, [triggerSuccess]);

  return (
    <ModalScrollView>
      <PreferencesContent
        ref={preferencesContentRef}
        isEditing
        onSaveComplete={handleSaveComplete}
      />
    </ModalScrollView>
  );
}
