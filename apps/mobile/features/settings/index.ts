// Main Components
export {AppearanceMenu} from './appearance-menu';

// App Settings
export {BiometricToggle, HapticToggle} from './app-settings';

// Profile Management
export {
  ProfileContentEditable as ProfileContent,
  type ProfileContentHandle,
} from './profile/profile-content';
export {useProfileForm} from './profile/use-profile-form';
export type {SaveProfileOptions} from './profile/profile-content';

// Organization Management
export {
  OrganizationContent,
  type OrganizationContentHandle,
  type SaveOrganizationOptions,
} from './organization/organization-content';
export {useOrganizationForm} from './organization/use-organization-form';

// Preferences
export {
  PreferencesContentEditable as PreferencesContent,
  type PreferencesContentHandle,
  type SavePreferencesOptions,
} from './preferences/preferences-content';

// Hooks
export {useSettingsItems} from './hooks/use-settings-items';

// Types
export type {
  SettingsItem,
  ToggleSettingsItem,
  DividerItem,
  ListItem,
} from './types';

// Utils
export {isDividerItem} from './types';
