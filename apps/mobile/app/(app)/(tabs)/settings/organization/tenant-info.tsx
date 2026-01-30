import {useCallback, useLayoutEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {KeyboardController} from 'react-native-keyboard-controller';
import {Palette} from '@/constants';
import {
  TenantInfoView,
  useTenantInfoForm,
  useTenantSnackbar,
} from '@/features/settings';
import {showAlert} from '@/utils';
import {AppIcons} from '@/utils/icons';
import {getHeaderOptions} from '@/utils/navigation/header-actions';
import type {SFSymbol} from 'sf-symbols-typescript';

export default function TenantInfoScreen() {
  const navigation = useNavigation();
  const {values, handleFieldChange, hasChanges, isSaving, save} =
    useTenantInfoForm();
  const {showSnack, snackbar} = useTenantSnackbar();

  const handleSave = useCallback(async () => {
    KeyboardController.dismiss({animated: true});
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
          iosSymbol: AppIcons.actions.save as SFSymbol,
          icon: AppIcons.actions.save,
          variant: 'done',
          tintColor: Palette.orange,
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
      <TenantInfoView values={values} onFieldChange={handleFieldChange} />
      {snackbar}
    </>
  );
}
