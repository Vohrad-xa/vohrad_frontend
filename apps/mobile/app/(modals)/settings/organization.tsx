import React, {useRef, useState, useLayoutEffect} from 'react';
import {StyleSheet, Text, Pressable, Platform} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from 'expo-router';
import {ThemedView, ModalScrollView} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {
  OrganizationContent,
  type OrganizationContentHandle,
} from '@/features/settings/organization';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';

export default function OrganizationScreen() {
  const {ds, theme} = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(ds, theme, insets.bottom);
  const navigation = useNavigation();
  const organizationContentRef = useRef<OrganizationContentHandle>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleEditSave = () => {
    if (isEditing) {
      organizationContentRef.current?.saveOrganization();
    } else {
      setIsEditing(true);
    }
  };

  const handleSaveComplete = () => {
    setIsEditing(false);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerBackTitle: 'Settings',
      headerRight: () => (
        <Pressable onPress={handleEditSave} style={{paddingHorizontal: 16}}>
          <Text style={{color: theme.text, fontSize: 17}}>
            {isEditing ? 'Save' : 'Edit'}
          </Text>
        </Pressable>
      ),
    });
  }, [navigation, theme.primary, isEditing]);

  return (
    <ThemedView style={styles.container}>
      <ModalScrollView contentContainerStyle={styles.content}>
        <OrganizationContent
          ref={organizationContentRef}
          isEditing={isEditing}
          onSaveComplete={handleSaveComplete}
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
