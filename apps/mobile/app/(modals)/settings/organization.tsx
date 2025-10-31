import React, {useRef, useState, useCallback} from 'react';
import {StyleSheet, Platform} from 'react-native';
import {useNavigation} from 'expo-router';
import {ThemedView, ModalScrollView} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {
  OrganizationContent,
  type OrganizationContentHandle,
  type SaveOrganizationOptions,
} from '@/features/settings/organization';
import {useSettingsHeader, useUnsavedChangesGuard} from '@/hooks';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';

export default function OrganizationScreen() {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);
  const navigation = useNavigation();
  const organizationContentRef = useRef<OrganizationContentHandle>(null);
  const [isEditing, setIsEditing] = useState(Platform.OS === 'web');
  const [hasChanges, setHasChanges] = useState(false);

  const checkForChanges = useCallback(() => {
    const changed = organizationContentRef.current?.hasChanges() ?? false;
    setHasChanges(changed);
  }, []);

  const {handleNavigationAfterSave} = useUnsavedChangesGuard({
    hasChanges: hasChanges && isEditing,
    contentRef: organizationContentRef,
    saveMethodName: 'saveOrganization',
    onSaveComplete: () => {
      setIsEditing(false);
      setHasChanges(false);
    },
    saveOptions: {skipConfirm: true} satisfies SaveOrganizationOptions,
  });

  const handleEditSave = useCallback(() => {
    if (Platform.OS === 'web') {
      organizationContentRef.current?.saveOrganization();
    } else if (isEditing) {
      organizationContentRef.current?.saveOrganization();
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
        <OrganizationContent
          ref={organizationContentRef}
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
