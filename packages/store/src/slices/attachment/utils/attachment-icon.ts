import {normalizeAttachmentExtension} from './normalizers';

export type AttachmentIconKey =
  | 'pdf'
  | 'word'
  | 'excel'
  | 'archive'
  | 'image'
  | 'text'
  | 'file';

type IconInput = {
  filename?: string | null;
  extension?: string | null;
  fileType?: string | null;
};

type IconKind =
  | 'pdf'
  | 'word'
  | 'excel'
  | 'archive'
  | 'image'
  | 'text'
  | 'other';

const extFromFilename = (filename?: string | null): string | null => {
  if (!filename) return null;
  const clean = filename.split('?')[0].split('#')[0];
  const idx = clean.lastIndexOf('.');
  if (idx <= 0 || idx === clean.length - 1) return null;
  return normalizeAttachmentExtension(clean.slice(idx + 1));
};

const extFromFileType = (fileType?: string | null): string | null => {
  if (!fileType) return null;
  const trimmed = fileType.trim().toLowerCase();
  if (!trimmed) return null;

  if (!trimmed.includes('/')) return normalizeAttachmentExtension(trimmed);

  if (trimmed === 'application/pdf') return 'pdf';
  if (trimmed.startsWith('image/')) return 'image';

  if (
    trimmed === 'application/zip' ||
    trimmed === 'application/x-zip-compressed' ||
    trimmed.includes('7z') ||
    trimmed.includes('rar')
  ) {
    return 'zip';
  }

  if (trimmed.includes('word')) return 'docx';
  if (trimmed.includes('excel') || trimmed.includes('spreadsheet'))
    return 'xlsx';
  if (trimmed.includes('powerpoint') || trimmed.includes('presentation'))
    return 'pptx';

  if (trimmed.includes('json')) return 'json';
  if (trimmed.includes('xml')) return 'xml';
  if (trimmed.startsWith('text/')) return 'txt';

  return null;
};

const classify = (ext: string): IconKind => {
  const normalized = ext.toLowerCase();

  if (normalized === 'pdf') return 'pdf';
  if (['doc', 'docx', 'odt'].includes(normalized)) return 'word';
  if (['xls', 'xlsx', 'csv', 'ods'].includes(normalized)) return 'excel';

  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(normalized)) return 'archive';
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'heic'].includes(normalized))
    return 'image';

  if (['txt', 'md', 'rtf'].includes(normalized)) return 'text';

  return 'other';
};

export function resolveAttachmentIconKey(input: IconInput): AttachmentIconKey {
  const ext =
    normalizeAttachmentExtension(input.extension) ??
    extFromFilename(input.filename) ??
    extFromFileType(input.fileType);

  const kind = ext ? classify(ext) : 'other';

  switch (kind) {
    case 'pdf':
      return 'pdf';
    case 'word':
      return 'word';
    case 'excel':
      return 'excel';
    case 'archive':
      return 'archive';
    case 'image':
      return 'image';
    case 'text':
      return 'text';
    default:
      return 'file';
  }
}
