import React, {useRef, useState, useCallback} from 'react';
import {StyleSheet} from 'react-native';
import {useNavigation} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ThemedView, ModalScrollView} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {
  ProfileContent,
  type ProfileContentHandle,
} from '@/features/settings/profile';
import {useSettingsHeader, useUnsavedChangesGuard} from '@/hooks';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';

export default function ProfileScreen() {
  const {ds, theme} = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(ds, theme, insets.bottom);
  const navigation = useNavigation();
  const profileContentRef = useRef<ProfileContentHandle>(null);
  const [isEditing, setIsEditing] = useState(false);
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
  });

  const handleEditSave = useCallback(() => {
    if (isEditing) {
      profileContentRef.current?.saveProfile();
    } else {
      setIsEditing(true);
    }
  }, [isEditing]);

  const handleSaveComplete = useCallback(() => {
    setIsEditing(false);
    setHasChanges(false);
    handleNavigationAfterSave();
  }, [handleNavigationAfterSave]);

  useSettingsHeader({
    navigation,
    isEditing,
    hasChanges,
    onSave: handleEditSave,
  });

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
  (ds: DSShape, theme: ThemeShape, insetBottom: number) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.background,
      },
      content: {
        gap: ds.spacing.xxl,
        paddingBottom: ds.spacing.xxl + insetBottom,
      },
    }),
  (ds, theme, insetBottom) => themeKey(theme, ds) + `|${insetBottom}`,
);
