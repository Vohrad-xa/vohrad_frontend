/**
 * Icon name constants using SF Symbols for iOS.
 * Organized by usage category for easy discovery.
 */
export const AppIcons = {
  /** Basic UI controls */
  ui: {
    close: 'xmark',
    back: 'chevron.left.2',
    more: 'ellipsis',
    menu: 'line.3.horizontal.decrease',
    chevronRight: 'chevron.right',
    chevronLeft: 'chevron.left',
    filter: 'equal',
  },

  /** Main app sections (for tabs/navigation) */
  tabs: {
    home: 'house.fill',
    vault: 'folder.fill',
    settings: 'gearshape.fill',
    profile: 'person.crop.circle.fill',
    item: 'rectangle.stack.fill',
    notifications: 'bell',
  },

  /** User actions and operations */
  actions: {
    add: 'plus',
    addUser: 'person.badge.plus',
    addItem: 'plus.square.on.square',
    edit: 'square.and.pencil',
    delete: 'trash',
    save: 'checkmark',
    close: 'xmark',
    share: 'square.and.arrow.up',
    refresh: 'arrow.clockwise',
    move: 'arrow.turn.down.right',
    download: 'icloud.and.arrow.down',
    scan: 'barcode.viewfinder',
    camera: 'camera',
    input: 'keyboard',
    select: 'checkmark.circle',
    logout: 'arrow.right.circle.fill',
  },

  /** App domain features */
  features: {
    item: 'rectangle.stack',
    category: 'square.grid.2x2',
    location: 'location',
    search: 'magnifyingglass',
    supplier: 'cart',
    organization: 'briefcase.circle.fill',
    maintenance: 'wrench',
    support: 'questionmark.circle',
    userManagement: 'person.2',
  },

  /** Files and documents */
  files: {
    document: 'doc',
    folder: 'folder',
    file: 'doc.plaintext',
    image: 'photo',
    imageFallback: 'photo.badge.exclamationmark',
    archive: 'archivebox',
    print: 'printer.inverse',
    list: 'list.bullet',
    others: 'questionmark.folder',
  },

  /** Status and feedback indicators */
  status: {
    success: 'checkmark.circle',
    warning: 'exclamationmark.triangle',
    error: 'exclamationmark.circle',
    info: 'info.circle.fill',
    help: 'questionmark.circle.fill',
    time: 'clock',
  },

  /** Preferences and settings */
  preferences: {
    settings: 'slider.horizontal.2.square',
    appearance: 'circle.lefthalf.filled',
    biometric: 'faceid',
    haptic: 'hand.tap.fill',
    language: 'globe.europe.africa.fill',
    privacy: 'hand.raised.fill',
    terms: 'doc.text.fill',
    plan: 'creditcard.fill',
  },
} as const;
