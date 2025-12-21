import {useCallback} from 'react';
import {useOrganizationManager} from '@sykamore/store';
import {showConfirmAlert, showAlert} from '@/utils';

export type SaveOrganizationOptions = {
  skipConfirm?: boolean;
};

export function useOrganization(isEditing: boolean) {
  const manager = useOrganizationManager(isEditing);

  const performUpdate = useCallback(async () => {
    if (!manager.hasChanges()) {
      showAlert({
        title: 'No Changes Detected',
        message: 'Update a field before saving your organization.',
      });
      return false;
    }

    await manager.submitUpdate();
    return true;
  }, [manager]);

  const saveOrganization = useCallback(
    async (options?: SaveOrganizationOptions) => {
      if (options?.skipConfirm) {
        return await performUpdate();
      }

      return new Promise<boolean>((resolve) => {
        showConfirmAlert({
          title: 'Update Organization',
          message: 'Are you sure you want to save these changes?',
          confirmText: 'Save',
          cancelText: 'Discard',
          cancelIsDestructive: true,
          onConfirm: async () => {
            const result = await performUpdate();
            resolve(result);
          },
          onCancel: () => {
            resolve(false);
          },
        });
      });
    },
    [performUpdate],
  );

  return {
    organization: manager.organization,
    stagedValues: manager.stagedValues,
    handleFieldChange: manager.handleFieldChange,
    hasChanges: manager.hasChanges,
    saveOrganization,
  };
}
