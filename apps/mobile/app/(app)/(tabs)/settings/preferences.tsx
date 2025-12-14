import React, {useRef, useState, useCallback} from 'react';
import {useNavigation} from 'expo-router';
import {ModalScrollView} from '@/components/ui';
import {
  PreferencesContent,
  type PreferencesContentHandle,
  type SavePreferencesOptions,
} from '@/features/settings';
import {useSettingsHeader, useUnsavedChangesGuard} from '@/hooks';

export default function PreferencesScreen() {
  const navigation = useNavigation();
  const preferencesContentRef = useRef<PreferencesContentHandle>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const checkForChanges = useCallback(() => {
    const changed = preferencesContentRef.current?.hasChanges() ?? false;
    setHasChanges(changed);
  }, []);

  const handleSave = useCallback(() => {
    preferencesContentRef.current?.savePreferences();
  }, []);

  const {handleNavigationAfterSave} = useUnsavedChangesGuard({
    hasChanges,
    contentRef: preferencesContentRef,
    saveMethodName: 'savePreferences',
    onSaveComplete: () => setHasChanges(false),
    saveOptions: {skipConfirm: true} satisfies SavePreferencesOptions,
  });

  const {triggerSuccess} = useSettingsHeader({
    navigation,
    isEditing: true,
    hasChanges,
    onSave: handleSave,
  });

  const handleSaveComplete = useCallback(() => {
    setHasChanges(false);
    triggerSuccess();
    handleNavigationAfterSave();
  }, [handleNavigationAfterSave, triggerSuccess]);

  return (
    <ModalScrollView>
      <PreferencesContent
        ref={preferencesContentRef}
        isEditing
        onSaveComplete={handleSaveComplete}
        onFieldChange={checkForChanges}
      />
    </ModalScrollView>
  );
}
