import React, {forwardRef, useImperativeHandle, useEffect} from 'react';
import {View} from 'react-native';
import {ThemedText} from '@/components/ui';
import {useTheme} from '@/providers';
import {useProfileForm, useProfileActions} from '../hooks';
import type {ProfileContentHandle, ProfileContentProps} from '../types';

/**
 * iOS-specific profile UI using native modules
 * TODO: iOS native modules
 */
export const ProfileContentEditable = forwardRef<
  ProfileContentHandle,
  ProfileContentProps
>(({isEditing, onSaveComplete, onFieldChange}, ref) => {
  const {ds} = useTheme();

  const {profile} = useProfileForm();
  const {hasChanges, handleSaveProfile} = useProfileActions({onSaveComplete});

  useImperativeHandle(ref, () => ({
    saveProfile: handleSaveProfile,
    hasChanges,
  }));

  useEffect(() => {
    onFieldChange?.();
  }, [profile, onFieldChange]);

  return (
    <View style={{padding: ds.spacing.xl, alignItems: 'center'}}>
      <ThemedText variant="headline">iOS Native Profile UI</ThemedText>
      <ThemedText variant="body" style={{marginTop: ds.spacing.md}}>
        To do
      </ThemedText>
      <ThemedText variant="caption" style={{marginTop: ds.spacing.sm}}>
        Editing: {isEditing ? 'Yes' : 'No'}
      </ThemedText>
    </View>
  );
});

ProfileContentEditable.displayName = 'ProfileContentEditableIOS';
