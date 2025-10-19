import {useLayoutEffect, useState, useCallback, useRef, useEffect} from 'react';
import {Platform, View, Text, Pressable} from 'react-native';
import {ThemedButton} from '@/components/ui';
import {useTheme} from '@/providers';
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
};

export function useSettingsHeader({
  navigation,
  isEditing,
  hasChanges,
  onSave,
}: UseSettingsHeaderOptions) {
  const {ds, theme} = useTheme();
  const [showSuccess, setShowSuccess] = useState(false);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerSuccess = useCallback(() => {
    setShowSuccess(true);
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
      headerBackTitle: 'Settings',
      headerLeft:
        Platform.OS === 'web'
          ? () => (
              <View style={{paddingHorizontal: ds.spacing.md}}>
                <ThemedButton
                  title="Back"
                  variant="primary"
                  size="sm"
                  onPress={() => navigation.goBack()}
                />
              </View>
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
    onSave,
    isEditing,
    theme.text,
    theme.accentGreen,
    ds.spacing.md,
    hasChanges,
    showSuccess,
  ]);

  return {triggerSuccess};
}
