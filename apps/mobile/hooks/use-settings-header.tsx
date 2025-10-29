import {useLayoutEffect, useState, useCallback, useRef, useEffect} from 'react';
import {Platform, View, Text, Pressable} from 'react-native';
import {useRouter} from 'expo-router';
import {ThemedButton} from '@/components/ui/themed-components';
import {useTheme} from '@/providers';
import {triggerHaptic} from '@/utils/haptics';
import {Icon, AppIcons} from '@/utils/icons';

type Navigation = {
  setOptions: (options: object) => void;
  goBack: () => void;
};

type UseSettingsHeaderOptions = {
  navigation: Navigation;
  isEditing: boolean;
  hasChanges: boolean;
  onSave: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
};

export function useSettingsHeader({
  navigation,
  isEditing,
  hasChanges,
  onSave,
  onCancel,
  showCancel = false,
}: UseSettingsHeaderOptions) {
  const {ds, theme} = useTheme();
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canShowCancel = showCancel && typeof onCancel === 'function';

  const triggerSuccess = useCallback(() => {
    setShowSuccess(true);
    void triggerHaptic('success');
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }
    successTimeoutRef.current = setTimeout(() => {
      setShowSuccess(false);
    }, 2000);
  }, []);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerBackTitle:
        canShowCancel && Platform.OS !== 'web' ? undefined : 'Back',
      headerLeft:
        Platform.OS === 'web'
          ? () => (
              <View style={{paddingHorizontal: ds.spacing.md}}>
                <ThemedButton
                  title="Back"
                  variant="primary"
                  size="sm"
                  onPress={() => router.back()}
                />
              </View>
            )
          : canShowCancel
            ? () => (
                <Pressable
                  onPress={onCancel}
                  style={{
                    paddingHorizontal: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 30,
                    minWidth: ds.components.tapTarget.minSize,
                  }}
                >
                  <Text style={{color: theme.destructive, fontSize: 17}}>
                    Cancel
                  </Text>
                </Pressable>
              )
            : undefined,
      headerRight: () =>
        Platform.OS === 'web' ? (
          <View style={{paddingHorizontal: ds.spacing.md}}>
            <ThemedButton
              title="Save"
              variant="primary"
              size="sm"
              onPress={showSuccess ? undefined : onSave}
              disabled={!hasChanges && !showSuccess}
              icon={showSuccess ? AppIcons.actions.save : undefined}
              iconPosition="left"
            />
          </View>
        ) : (
          <Pressable
            onPress={onSave}
            style={{
              paddingHorizontal: 20,
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 30,
              minWidth: ds.components.tapTarget.minSize,
            }}
            disabled={showSuccess}
          >
            {showSuccess ? (
              <Icon
                name={AppIcons.actions.save}
                size="xxl"
                color={theme.accentGreen}
              />
            ) : (
              <Text style={{color: theme.text, fontSize: 17}}>
                {isEditing ? 'Save' : 'Edit'}
              </Text>
            )}
          </Pressable>
        ),
    });
  }, [
    navigation,
    router,
    onSave,
    isEditing,
    theme.text,
    theme.accentGreen,
    theme.destructive,
    ds.spacing.md,
    ds.components.tapTarget.minSize,
    hasChanges,
    showSuccess,
    canShowCancel,
    onCancel,
  ]);

  return {triggerSuccess};
}
