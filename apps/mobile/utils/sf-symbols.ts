// sf-symbols for iOS

export const SFSymbols = {
  house: 'house',
  houseFill: 'house.fill',
  bell: 'bell',
  bellFill: 'bell.fill',
  folder: 'folder',
  folderFill: 'folder.fill',
  lock: 'lock',
  lockFill: 'lock.fill',
  rectangleStackFill: 'rectangle.stack.fill',
  docTextFill: 'doc.text',
  archiveBoxFill: 'archivebox.fill',
} as const;

export type SFSymbolName = (typeof SFSymbols)[keyof typeof SFSymbols];
