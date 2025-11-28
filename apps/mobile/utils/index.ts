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

// Alerts
export {showAlert, showConfirmAlert} from './alert';

// UI & Styling
export {makeStyleFactory} from './style-factory';
export {formatDate, formatDateInput, parseDateInput} from './format-date';

// Sorting
export {
  sortByDate,
  sortByString,
  sortByNumber,
  type SortOrder,
} from './sorting';

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
