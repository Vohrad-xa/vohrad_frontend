/**
 * Icon name constants using Material Community Icons for Android.
 * Organized by usage category for easy discovery.
 */
export const AppIcons = {
  /** Basic UI controls */
  ui: {
    close: 'close',
    back: 'arrow-left',
    more: 'dots-horizontal',
    menu: 'menu',
    chevronRight: 'chevron-right',
    chevronLeft: 'chevron-left',
    filter: 'filter-variant',
    search: 'magnify',
  },

  /** Main app sections (for tabs/navigation) */
  tabs: {
    home: 'home-variant',
    vault: 'folder-open-outline',
    settings: 'cog-outline',
    profile: 'account-circle',
    notifications: 'bell-outline',
    item: 'layers',
  },

  /** User actions and operations */
  actions: {
    add: 'plus',
    addUser: 'account-plus-outline',
    addItem: 'content-duplicate',
    edit: 'pencil-outline',
    delete: 'delete-outline',
    save: 'check',
    close: 'close',
    share: 'share-outline',
    refresh: 'refresh',
    move: 'arrow-up-right',
    download: 'cloud-arrow-down-outline',
    scan: 'line-scan',
    camera: 'camera-outline',
    input: 'keyboard-outline',
    select: 'check-circle-outline',
    logout: 'logout',
  },

  /** App domain features */
  features: {
    item: 'layers-outline',
    category: 'view-grid-outline',
    location: 'navigation-variant-outline',
    supplier: 'cart-outline',
    organization: 'briefcase-variant',
    maintenance: 'wrench-outline',
    support: 'help-circle',
    userManagement: 'account-supervisor',
  },

  /** Files and documents */
  files: {
    document: 'file-document-outline',
    folder: 'folder-outline',
    file: 'file-outline',
    image: 'image-outline',
    imageFallback: 'image-off-outline',
    archive: 'archive-outline',
    print: 'printer-outline',
    list: 'format-list-bulleted',
  },

  /** Status and feedback indicators */
  status: {
    success: 'check-circle-outline',
    warning: 'alert-outline',
    error: 'alert-circle-outline',
    info: 'information-outline',
    help: 'help-circle-outline',
    time: 'clock-outline',
  },

  /** Preferences and settings */
  preferences: {
    settings: 'tune',
    appearance: 'theme-light-dark',
    biometric: 'fingerprint',
    haptic: 'cellphone-vibrate',
    language: 'google-translate',
    privacy: 'lock-outline',
    terms: 'file-document-outline',
    plan: 'credit-card-outline',
  },
} as const;
