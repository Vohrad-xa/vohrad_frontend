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
  rectangleStackFill: 'rectangle.fill.on.rectangle.fill',
  docText: 'doc.text',
  doc: 'doc',
  docTextFill: 'doc.text',
  docFill: 'doc.fill',
  archiveBoxFill: 'archivebox.fill',
  archivebox: 'archivebox',
  photoFill: 'photo.fill',
  photo: 'photo',
  videoFill: 'video.fill',
  ellipsis: 'ellipsis',
  plusCircle: 'plus.circle',
  camera: 'camera',
  cameraFill: 'camera.fill',
  lineHorizontalFilter: 'line.horizontal.3.circle',
  checkmarkCircleOutline: 'checkmark.circle',
  addUser: 'person.badge.plus',
  settings: 'gear',
} as const;

export type SFSymbolName = (typeof SFSymbols)[keyof typeof SFSymbols];
