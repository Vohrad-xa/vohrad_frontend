import React, {useRef, useState, useCallback} from 'react';
import {StyleSheet, Platform} from 'react-native';
import {useNavigation} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ThemedView, ModalScrollView} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {
  OrganizationContent,
  type OrganizationContentHandle,
} from '@/features/settings/organization';
import {useSettingsHeader} from '@/hooks';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';

export default function OrganizationScreen() {
  const {ds, theme} = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(ds, theme, insets.bottom);
  const navigation = useNavigation();
  const organizationContentRef = useRef<OrganizationContentHandle>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const checkForChanges = useCallback(() => {
    const changed = organizationContentRef.current?.hasChanges() ?? false;
    setHasChanges(changed);
  }, []);

  const handleEditSave = useCallback(() => {
    if (Platform.OS === 'web') {
      organizationContentRef.current?.saveOrganization();
    } else if (isEditing) {
      organizationContentRef.current?.saveOrganization();
    } else {
      setIsEditing(true);
    }
  }, [isEditing]);

  const handleSaveComplete = () => {
    setIsEditing(false);
    setHasChanges(false);
  };

  useSettingsHeader({
    navigation,
    isEditing,
    hasChanges,
    onSave: handleEditSave,
  });

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
