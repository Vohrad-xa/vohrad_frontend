// Storage & Secure Storage
export {
  getItem,
  setItem,
  removeItem,
  setTenantSubdomain,
  getTenantSubdomain,
  clearTenantSubdomain,
} from './storage';
export {
  getSecureItem,
  setSecureItem,
  removeSecureItem,
  secureStorage,
} from './secure-storage';

// Icons
export {Icon, AppIcons, type IconName} from './icons';
export {SFSymbols, type SFSymbolName} from './sf-symbols';

// Validation
export * as validators from './validators';
// Note: validateEmail and isEmail are now imported from @vohrad/types
// export {validateEmail, isEmail} from './validators';

// Alerts
export {showAlert, showConfirmAlert} from './alert';

// UI & Styling
export {makeStyleFactory} from './style-factory';
export {formatDate} from './format-date';

// Haptics
export {
  triggerHaptic,
  loadHapticsPreference,
  persistHapticsPreference,
  setHapticsEnabled,
  getHapticsEnabled,
  type HapticType,
} from './haptics';

// System
export {generateVersion} from './versioning';
export {bootstrap} from './bootstrap';
