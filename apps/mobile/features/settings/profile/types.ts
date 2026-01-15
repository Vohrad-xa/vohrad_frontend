export type SaveProfileOptions = {
  skipConfirm?: boolean;
};

export type ProfileContentHandle = {
  saveProfile: (options?: SaveProfileOptions) => void;
  hasChanges: () => boolean;
};

export type ProfileContentProps = {
  isEditing: boolean;
  onSaveComplete?: () => void;
  onFieldChange?: () => void;
};
