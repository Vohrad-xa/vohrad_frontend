import React, {useState, useEffect, useRef, useCallback} from 'react';
import {StyleSheet, Platform, View} from 'react-native';
import {
  Stack,
  useRouter,
  useNavigation,
  useLocalSearchParams,
} from 'expo-router';
import {
  HeaderButton,
  ModalScrollView,
  ThemedView,
  ThemedText,
  ThemedButton,
} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useItemDetail} from '@/features/item';
import {SpecificationsForm} from '@/features/item/detail/specifications/specifications-form';
import {useTheme, useHaptic} from '@/providers';
import {AppIcons} from '@/utils';
import {makeStyleFactory} from '@/utils/style-factory';

export default function SpecificationsModal() {
  const {ds, theme} = useTheme();
  const {triggerHaptic} = useHaptic();
  const router = useRouter();
  const navigation = useNavigation();
  const styles = createStyles(ds, theme);
  const {id: itemId} = useLocalSearchParams<{id: string}>();
  const {item, isLoading} = useItemDetail(itemId);

  const [hasChanges, setHasChanges] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const specificationsFormRef = useRef<{
    performSave: () => Promise<void>;
    isEditMode: boolean;
    toggleEditMode: () => void;
  }>(null);

  const handleClose = () => {
    triggerHaptic('light');
    router.dismiss();
  };

  const triggerSuccess = useCallback(() => {
    setShowSuccess(true);
    triggerHaptic('success');
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }
    successTimeoutRef.current = setTimeout(() => {
      setShowSuccess(false);
    }, 2000);
  }, [triggerHaptic]);

  const handleSave = useCallback(async () => {
    triggerHaptic('selection');
    try {
      await specificationsFormRef.current?.performSave();
      triggerSuccess();
      setTimeout(() => {
        router.dismiss();
      }, 1000);
    } catch (_error) {
      // Error is handled by the form component
    }
  }, [triggerSuccess, triggerHaptic, router]);

  const handleEditToggle = useCallback(() => {
    triggerHaptic('light');
    specificationsFormRef.current?.toggleEditMode();
    setIsEditMode((prev) => !prev);
  }, [triggerHaptic]);

  // Update header options based on changes and edit mode
  useEffect(() => {
    if (showSuccess) {
      // Show success checkmark
      navigation.setOptions({
        headerRight: () => (
          <HeaderButton
            icon={AppIcons.actions.save}
            iconColor={theme.accentGreen}
            accessibilityLabel="Saved"
          />
        ),
      });
    } else if (hasChanges) {
      // Show Save button
      navigation.setOptions({
        headerRight: () => (
          <View style={styles.headerButtonContainer}>
            <ThemedButton
              title="Save"
              variant="ghost"
              size="sm"
              onPress={handleSave}
            />
          </View>
        ),
      });
    } else if (item && Object.keys(item.specifications ?? {}).length > 0) {
      // Show Edit/Done button
      navigation.setOptions({
        headerRight: () => (
          <View style={styles.headerButtonContainer}>
            <ThemedButton
              title={isEditMode ? 'Done' : 'Edit'}
              variant="ghost"
              size="sm"
              onPress={handleEditToggle}
            />
          </View>
        ),
      });
    } else {
      navigation.setOptions({
        headerRight: undefined,
      });
    }
  }, [
    hasChanges,
    showSuccess,
    isEditMode,
    item,
    handleSave,
    handleEditToggle,
    navigation,
    theme.accentGreen,
    styles.headerButtonContainer,
  ]);

  // Clean up success timeout
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Specifications',
          headerShown: true,
          headerTransparent: Platform.OS === 'ios',
          headerStyle:
            Platform.OS === 'android' ? styles.headerStyleAndroid : undefined,
          headerTitleStyle: styles.headerTitleStyle,
          headerTitleAlign: 'center',
          headerLeft: () => (
            <HeaderButton
              icon={AppIcons.navigation.close}
              onPress={handleClose}
              accessibilityLabel="Close specifications"
            />
          ),
        }}
      />
      <ThemedView style={styles.container}>
        <ModalScrollView>
          <View>
            {!isLoading && item ? (
              <SpecificationsForm
                ref={specificationsFormRef}
                item={item}
                onHasChangesChange={setHasChanges}
                onSave={() => {
                  // Save completed successfully
                }}
              />
            ) : (
              <View style={{alignItems: 'center'}}>
                <ThemedText variant="body" style={{color: theme.muted}}>
                  Loading specifications...
                </ThemedText>
              </View>
            )}
          </View>
        </ModalScrollView>
      </ThemedView>
    </>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.secondbackground,
      },
      headerStyleAndroid: {
        backgroundColor: theme.background,
      },
      headerTitleStyle: {
        color: theme.text,
        fontFamily: 'System',
        fontWeight: '600',
      },
      headerButtonContainer: {
        paddingHorizontal: Platform.OS === 'android' ? 0 : ds.spacing.sm,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
