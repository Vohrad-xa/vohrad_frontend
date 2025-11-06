// sf-symbols for iOS

export const SFSymbols = {
  house: 'house',
  houseFill: 'house.fill',
  bell: 'bell',
  bellFill: 'bell.fill',
  folder: 'folder',
  folderFill: 'folder.fill',
  folderBadge: 'folder.badge',
} as const;

export type SFSymbolName = (typeof SFSymbols)[keyof typeof SFSymbols];
