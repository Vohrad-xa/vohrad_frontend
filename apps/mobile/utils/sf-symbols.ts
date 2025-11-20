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
  docFill: 'doc.fill',
  archiveBoxFill: 'archivebox.fill',
  archiveboxFill: 'archivebox.fill',
  photoFill: 'photo.fill',
  videoFill: 'video.fill',
} as const;

export type SFSymbolName = (typeof SFSymbols)[keyof typeof SFSymbols];
