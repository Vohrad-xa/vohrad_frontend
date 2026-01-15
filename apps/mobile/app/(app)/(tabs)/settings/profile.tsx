import React, {useRef, useState, useCallback} from 'react';
import {Platform} from 'react-native';
import {useNavigation} from 'expo-router';
import {ProfileContent, type ProfileContentHandle} from '@/features/settings';
import {useSettingsHeader} from '@/hooks';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const profileContentRef = useRef<ProfileContentHandle>(null);
  const [isEditing, setIsEditing] = useState(Platform.OS === 'web');
  const [hasChanges, setHasChanges] = useState(false);

  const checkForChanges = useCallback(() => {
    const changed = profileContentRef.current?.hasChanges() ?? false;
    setHasChanges(changed);
  }, []);

  const handleEditSave = useCallback(() => {
    if (isEditing) {
      profileContentRef.current?.saveProfile();
    } else {
      setIsEditing(true);
    }
  }, [isEditing]);

  const {triggerSuccess} = useSettingsHeader({
    navigation,
    isEditing,
    hasChanges,
    onSave: handleEditSave,
  });

  const handleSaveComplete = useCallback(() => {
    setIsEditing(false);
    setHasChanges(false);
    triggerSuccess();
  }, [triggerSuccess]);

  return (
    <ProfileContent
      ref={profileContentRef}
      isEditing={isEditing}
      onSaveComplete={handleSaveComplete}
      onFieldChange={checkForChanges}
    />
  );
}
