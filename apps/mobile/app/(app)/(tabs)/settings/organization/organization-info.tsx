import React, {useCallback, useLayoutEffect} from 'react';
import {Platform} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Palette} from '@/constants';
import {
  OrganizationInfoView,
  useOrganizationInfoForm,
  useOrganizationSnackbar,
} from '@/features/settings';
import {AppIcons} from '@/utils/icons';
import {getHeaderOptions} from '@/utils/navigation/header-actions';
import {showAlert} from '@/utils';

export default function OrganizationInfoScreen() {
  const navigation = useNavigation();
  const {values, handleFieldChange, hasChanges, isSaving, save} =
    useOrganizationInfoForm();
  const {showSnack, snackbar} = useOrganizationSnackbar();

  const handleSave = useCallback(async () => {
    const changedLabels = await save();
    if (!changedLabels) {
      showAlert({
        title: 'No Changes Detected',
        message: 'Update a field before saving your organization.',
      });
      return;
    }

    const message =
      changedLabels.length === 1
        ? `${changedLabels[0]} updated successfully`
        : 'Details updated successfully';
    showSnack(message);
  }, [save, showSnack]);

  useLayoutEffect(() => {
    const options = getHeaderOptions({
      right: [
        {
          type: 'button',
          key: 'save',
          label: 'Save',
          iosSymbol: AppIcons.actions.save,
          icon: AppIcons.actions.save,
          variant: 'done',
          tintColor: Platform.OS === 'ios' ? Palette.orange : undefined,
          disabled: !hasChanges || isSaving,
          onPress: () => {
            void handleSave();
          },
        },
      ],
    });

    navigation.setOptions({
      headerRight: options.headerRight,
      unstable_headerRightItems: options.unstable_headerRightItems,
    });
  }, [navigation, hasChanges, isSaving, handleSave]);

  return (
    <>
      <OrganizationInfoView values={values} onFieldChange={handleFieldChange} />
      {snackbar}
    </>
  );
}
