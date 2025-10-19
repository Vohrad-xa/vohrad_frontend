import React, {useRef, useState, useCallback} from 'react';
import {StyleSheet} from 'react-native';
import {
  usePreventRemove,
  type NavigationAction,
} from '@react-navigation/native';
import {useNavigation} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ThemedView, ModalScrollView} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {
  PreferencesContent,
  type PreferencesContentHandle,
  type SavePreferencesOptions,
} from '@/features/settings/preferences';
import {useSettingsHeader} from '@/hooks';
import {useTheme} from '@/providers';
import {showConfirmAlert} from '@/utils';
import {makeStyleFactory} from '@/utils/style-factory';

export default function PreferencesScreen() {
  const {ds, theme} = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(ds, theme, insets.bottom);
  const navigation = useNavigation();
  const preferencesContentRef = useRef<PreferencesContentHandle>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const pendingNavigationActionRef = useRef<NavigationAction | null>(null);

  const checkForChanges = useCallback(() => {
    const changed = preferencesContentRef.current?.hasChanges() ?? false;
    setHasChanges(changed);
  }, []);

  const handleSave = useCallback(() => {
    preferencesContentRef.current?.savePreferences();
  }, []);

  const handleSaveComplete = () => {
    setHasChanges(false);
    const pendingAction = pendingNavigationActionRef.current;
    if (pendingAction) {
      pendingNavigationActionRef.current = null;
      navigation.dispatch(pendingAction);
    }
  };

  useSettingsHeader({
    navigation,
    isEditing: true,
    hasChanges,
    onSave: handleSave,
  });

  usePreventRemove(hasChanges, (event) => {
    showConfirmAlert({
      title: 'Save Changes?',
      message: 'You have unsaved edits. Save before leaving?',
      confirmText: 'Save',
      cancelText: 'Discard',
      cancelIsDestructive: true,
      onConfirm: () => {
        pendingNavigationActionRef.current = event.data.action;
        preferencesContentRef.current?.savePreferences({
          skipConfirm: true,
        } satisfies SavePreferencesOptions);
      },
      onCancel: () => {
        pendingNavigationActionRef.current = null;
        navigation.dispatch(event.data.action);
      },
    });
  });

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
