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
    chevronUpDown: 'unfold-more-horizontal',
  },

  /** Main app sections (for tabs/navigation) */
  tabs: {
    home: 'home',
    vault: 'cloud-lock',
    settings: 'file-cog',
    profile: 'account-circle',
    notifications: 'bell-outline',
    item: 'view-dashboard',
  },

  /** User actions and operations */
  actions: {
    add: 'plus',
    addUser: 'account-plus-outline',
    addItem: 'content-duplicate',
    edit: 'pencil-outline',
    delete: 'delete',
    save: 'check',
    close: 'close',
    share: 'share-variant',
    refresh: 'refresh',
    move: 'arrow-up-right',
    download: 'cloud-arrow-down-outline',
    scan: 'line-scan',
    camera: 'camera-outline',
    input: 'keyboard-outline',
    select: 'check-circle-outline',
    logout: 'logout',
    enableTorch: 'flash',
    disableTorch: 'flash-off',
  },

  /** App domain features */
  features: {
    item: 'card-multiple-outline',
    category: 'view-grid-outline',
    location: 'map-marker-radius-outline',
    supplier: 'cart-outline',
    organization: 'briefcase-variant',
    maintenance: 'folder-wrench-outline',
    support: 'help-circle',
    userManagement: 'account-supervisor',
    attachments: 'file-document-outline',
  },

  /** Files and documents */
  files: {
    document: 'file-document-outline',
    folder: 'folder',
    file: 'file-outline',
    image: 'image-outline',
    imageFallback: 'image-off-outline',
    archive: 'archive-outline',
    print: 'printer-outline',
    list: 'format-list-bulleted',
    others: 'folder-question-outline',
    test: 'outlined-info',
  },

  /** Status and feedback indicators */
  status: {
    success: 'check-circle-outline',
    warning: 'alert-outline',
    error: 'alert-circle-outline',
    info: 'information',
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
