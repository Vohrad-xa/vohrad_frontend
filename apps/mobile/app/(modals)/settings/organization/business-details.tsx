import React, {useRef, useState, useCallback} from 'react';
import {StyleSheet, Platform} from 'react-native';
import {useNavigation} from 'expo-router';
import {ThemedView, ModalScrollView} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import type {SaveOrganizationOptions} from '@/features/settings';
import {
  BusinessDetailsContent,
  type BusinessDetailsContentHandle,
} from '@/features/settings/organization';
import {useSettingsHeader, useUnsavedChangesGuard} from '@/hooks';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils';

export default function BusinessDetailsScreen() {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);
  const navigation = useNavigation();
  const businessDetailsContentRef = useRef<BusinessDetailsContentHandle>(null);
  const [isEditing, setIsEditing] = useState(Platform.OS === 'web');
  const [hasChanges, setHasChanges] = useState(false);

  const checkForChanges = useCallback(() => {
    const changed = businessDetailsContentRef.current?.hasChanges() ?? false;
    setHasChanges(changed);
  }, []);

  const {handleNavigationAfterSave} = useUnsavedChangesGuard({
    hasChanges: hasChanges && isEditing,
    contentRef: businessDetailsContentRef,
    saveMethodName: 'saveOrganization',
    onSaveComplete: () => {
      setIsEditing(false);
      setHasChanges(false);
    },
    saveOptions: {skipConfirm: true} satisfies SaveOrganizationOptions,
  });

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
        <BusinessDetailsContent
          ref={businessDetailsContentRef}
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
