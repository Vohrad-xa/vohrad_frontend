import {AppIcons} from './icons';
import type { IconProps} from './icons';

type Input = {
  filename?: string | null;
  extension?: string | null;
  fileType?: string | null;
};

const normalizeExt = (v?: string | null): string | null => {
  if (!v) return null;
  const s = v.trim().toLowerCase();
  if (!s) return null;
  return s.startsWith('.') ? s.slice(1) : s;
};

const extFromFilename = (filename?: string | null): string | null => {
  if (!filename) return null;
  const clean = filename.split('?')[0].split('#')[0];
  const idx = clean.lastIndexOf('.');
  if (idx <= 0 || idx === clean.length - 1) return null;
  return normalizeExt(clean.slice(idx + 1));
};

const extFromFileType = (fileType?: string | null): string | null => {
  if (!fileType) return null;
  const t = fileType.trim().toLowerCase();
  if (!t) return null;

  if (!t.includes('/')) return normalizeExt(t);

  if (t === 'application/pdf') return 'pdf';
  if (t.startsWith('image/')) return 'image';

  if (
    t === 'application/zip' ||
    t === 'application/x-zip-compressed' ||
    t.includes('7z') ||
    t.includes('rar')
  ) {
    return 'zip';
  }

  if (t.includes('word')) return 'docx';
  if (t.includes('excel') || t.includes('spreadsheet')) return 'xlsx';
  if (t.includes('powerpoint') || t.includes('presentation')) return 'pptx';

  if (t.includes('json')) return 'json';
  if (t.includes('xml')) return 'xml';
  if (t.startsWith('text/')) return 'txt';

  return null;
};

const classify = (ext: string) => {
  const e = ext.toLowerCase();

  if (e === 'pdf') return 'pdf';
  if (['doc', 'docx', 'odt'].includes(e)) return 'word';
  if (['xls', 'xlsx', 'csv', 'ods'].includes(e)) return 'excel';
  if (['ppt', 'pptx', 'odp'].includes(e)) return 'ppt';

  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(e)) return 'archive';
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'heic'].includes(e))
    return 'image';

  if (['txt', 'md', 'rtf'].includes(e)) return 'text';

  return 'other';
};

export const getAttachmentFileIcon = (input: Input): IconProps => {
  const ext =
    normalizeExt(input.extension) ??
    extFromFilename(input.filename) ??
    extFromFileType(input.fileType);

  const kind = ext ? classify(ext) : 'other';

  switch (kind) {
    case 'pdf':
      return {
        name: AppIcons.files.pdf,
        colorToken: 'destructive',
        symbolType: 'palette',
        symbolColorTokens: ['destructive', 'offWhite'],
        fontWeight: 'ultraLight',
      };
    case 'word':
      return {
        name: AppIcons.files.word,
        colorToken: 'accentBlue',
        symbolType: 'palette',
        symbolColorTokens: ['accentBlue', 'offWhite'],
        fontWeight: 'ultraLight',
      };
    case 'excel':
      return {
        name: AppIcons.files.excel,
        colorToken: 'accentGreen',
        symbolType: 'palette',
        symbolColorTokens: ['accentGreen', 'offWhite'],
        fontWeight: 'ultraLight',
      };
    case 'ppt':
      return {
        name: AppIcons.files.ppt,
        colorToken: 'accentOrange',
        symbolType: 'palette',
        symbolColorTokens: ['accentOrange', 'offWhite'],
      };
    case 'archive':
      return {
        name: AppIcons.files.archive,
        symbolType: 'palette',
        colorToken: 'accentBlue',
        fontWeight: 'thin',
      };
    case 'image':
      return {
        name: AppIcons.files.image,
        colorToken: 'accentBlue',
        fontWeight: 'thin',
      };
    case 'text':
      return {
        name: AppIcons.files.text,
        colorToken: 'muted',
        symbolType: 'palette',
        symbolColorTokens: ['text', 'offWhite'],
        fontWeight: 'ultraLight',
      };
    default:
      return {
        name: AppIcons.files.file,
        colorToken: 'text',
        symbolType: 'hierarchical',
      };
  }
};
