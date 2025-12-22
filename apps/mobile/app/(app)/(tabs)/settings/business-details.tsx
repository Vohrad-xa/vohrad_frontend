import React, {useRef, useState, useCallback} from 'react';
import {Platform} from 'react-native';
import {useNavigation} from 'expo-router';
import {ModalScrollView} from '@/components/ui';
import {
  BusinessDetailsContent,
  type BusinessDetailsContentHandle,
} from '@/features/settings';
import {useSettingsHeader} from '@/hooks';

export default function BusinessDetailsScreen() {
  const navigation = useNavigation();
  const businessDetailsContentRef = useRef<BusinessDetailsContentHandle>(null);
  const [isEditing, setIsEditing] = useState(Platform.OS === 'web');

  const handleEditSave = useCallback(() => {
    if (Platform.OS === 'web') {
      businessDetailsContentRef.current?.saveOrganization();
    } else if (isEditing) {
      businessDetailsContentRef.current?.saveOrganization();
    } else {
      setIsEditing(true);
    }
  }, [isEditing]);

  const {triggerSuccess} = useSettingsHeader({
    navigation,
    isEditing,
    onSave: handleEditSave,
  });

  const handleSaveComplete = useCallback(() => {
    setIsEditing(false);
    triggerSuccess();
  }, [triggerSuccess]);

  return (
    <ModalScrollView>
      <BusinessDetailsContent
        ref={businessDetailsContentRef}
        isEditing={isEditing}
        onSaveComplete={handleSaveComplete}
      />
    </ModalScrollView>
  );
}
