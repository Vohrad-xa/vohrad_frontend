import {AppIcons, type IconProps} from './icons';
import type {AttachmentIconKey} from '@sykamore/store';

const attachmentIconMap: Record<AttachmentIconKey, IconProps> = {
  pdf: {
    name: AppIcons.files.pdf,
    colorToken: 'destructive',
    symbolType: 'palette',
    symbolColorTokens: ['destructive', 'offWhite'],
    fontWeight: 'ultraLight',
  },
  word: {
    name: AppIcons.files.word,
    colorToken: 'accentBlue',
    symbolType: 'palette',
    symbolColorTokens: ['accentBlue', 'offWhite'],
    fontWeight: 'ultraLight',
  },
  excel: {
    name: AppIcons.files.excel,
    colorToken: 'accentGreen',
    symbolType: 'palette',
    symbolColorTokens: ['accentGreen', 'offWhite'],
    fontWeight: 'ultraLight',
  },
  ppt: {
    name: AppIcons.files.ppt,
    colorToken: 'accentOrange',
    symbolType: 'palette',
    symbolColorTokens: ['accentOrange', 'offWhite'],
  },
  archive: {
    name: AppIcons.files.archive,
    symbolType: 'palette',
    colorToken: 'accentBlue',
    fontWeight: 'thin',
  },
  image: {
    name: AppIcons.files.image,
    colorToken: 'accentBlue',
    fontWeight: 'thin',
  },
  text: {
    name: AppIcons.files.text,
    colorToken: 'muted',
    symbolType: 'palette',
    symbolColorTokens: ['text', 'offWhite'],
    fontWeight: 'ultraLight',
  },
  file: {
    name: AppIcons.files.file,
    colorToken: 'text',
    symbolType: 'hierarchical',
  },
};

export const getAttachmentFileIcon = (iconKey: AttachmentIconKey): IconProps =>
  attachmentIconMap[iconKey];
