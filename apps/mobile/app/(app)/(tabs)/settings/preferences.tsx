import React, {useRef, useState, useCallback} from 'react';
import {StyleSheet} from 'react-native';
import {useNavigation} from 'expo-router';
import {ThemedView, ModalScrollView} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {
  PreferencesContent,
  type PreferencesContentHandle,
  type SavePreferencesOptions,
} from '@/features/settings';
import {useSettingsHeader, useUnsavedChangesGuard} from '@/hooks';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils';

export default function PreferencesScreen() {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);
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
    <ThemedView style={styles.container}>
      <ModalScrollView contentContainerStyle={styles.content}>
        <PreferencesContent
          ref={preferencesContentRef}
          isEditing
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
