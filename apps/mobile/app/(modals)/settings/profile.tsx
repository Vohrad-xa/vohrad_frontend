import React, {useRef, useState, useCallback} from 'react';
import {StyleSheet, Platform} from 'react-native';
import {useNavigation} from 'expo-router';
import {ThemedView, ModalScrollView} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {
  ProfileContent,
  type ProfileContentHandle,
  type SaveProfileOptions,
} from '@/features/settings/profile';
import {useSettingsHeader, useUnsavedChangesGuard} from '@/hooks';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';

export default function ProfileScreen() {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);
  const navigation = useNavigation();
  const profileContentRef = useRef<ProfileContentHandle>(null);
  const [isEditing, setIsEditing] = useState(Platform.OS === 'web');
  const [hasChanges, setHasChanges] = useState(false);

  const checkForChanges = useCallback(() => {
    const changed = profileContentRef.current?.hasChanges() ?? false;
    setHasChanges(changed);
  }, []);

  const {handleNavigationAfterSave} = useUnsavedChangesGuard({
    hasChanges: hasChanges && isEditing,
    contentRef: profileContentRef,
    saveMethodName: 'saveProfile',
    onSaveComplete: () => {
      setIsEditing(false);
      setHasChanges(false);
    },
    saveOptions: {skipConfirm: true} satisfies SaveProfileOptions,
  });

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
    handleNavigationAfterSave();
  }, [handleNavigationAfterSave, triggerSuccess]);

  return (
    <ThemedView style={styles.container}>
      <ModalScrollView contentContainerStyle={styles.content}>
        <ProfileContent
          ref={profileContentRef}
          isEditing={isEditing}
          onSaveComplete={handleSaveComplete}
          onFieldChange={checkForChanges}
        />
      </ModalScrollView>
    </ThemedView>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
      },
      content: {
        gap: ds.spacing.xxl,
        paddingBottom: ds.spacing.xxl,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
