import {Platform} from 'react-native';
import {Directory, File, Paths} from 'expo-file-system';

let Share: typeof import('react-native-share').default | undefined;

if (Platform.OS !== 'web') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require('react-native-share') as
    | {default?: typeof Share}
    | typeof Share;
  // eslint-disable-next-line
  Share = (mod as any)?.default ?? mod;
}

type ShareResult = {
  success: boolean;
  dismissedAction?: boolean;
  message?: string;
};

export type DocumentDownloadParams = {
  sourceUrl: string;
  id: string;
  originalFilename?: string;
  extension?: string;
};

export async function downloadDocumentFile(
  options: Required<
    Pick<
      DocumentDownloadParams,
      'sourceUrl' | 'id' | 'originalFilename' | 'extension'
    >
  >,
): Promise<string> {
  if (Platform.OS === 'web') {
    // For web, just return the URL
    return options.sourceUrl;
  }

  // Share uses RNShare's FileProvider
  const downloadsDir = new Directory(Paths.cache, 'downloads');
  ensureDirectoryExists(downloadsDir);

  const fileName = buildDownloadFileName(options);
  const targetFile = new File(downloadsDir, fileName);
  const downloadedFile = await File.downloadFileAsync(
    options.sourceUrl,
    targetFile,
    {idempotent: true},
  );

  if (!downloadedFile?.uri) {
    throw new Error('Download failed to produce a file URI');
  }

  return downloadedFile.uri;
}

export async function shareDownloadedFile(
  localPath: string,
  displayName: string,
  _mimeType?: string,
): Promise<ShareResult> {
  if (Platform.OS === 'web') {
    try {
      const response = await fetch(localPath);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = displayName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    } catch (error) {
      console.error('Failed to download file on web:', error);
      window.open(localPath, '_blank');
    }
    return {success: true, message: 'downloaded'};
  }

  if (!localPath) {
    throw new Error('Missing local file path for sharing');
  }

  if (!Share) {
    throw new Error('Share is not available on this platform');
  }

  const uri = normalizeShareUri(localPath);
  const mimeType = _mimeType?.trim() ?? undefined;

  return Share.open({
    url: uri,
    type: mimeType,
    filename: displayName,
    failOnCancel: false,
  });
}

export async function shareDownloadedFiles(
  localPaths: string[],
): Promise<ShareResult> {
  if (localPaths.length === 0) {
    throw new Error('Missing local file paths for sharing');
  }

  if (Platform.OS === 'web') {
    for (const localPath of localPaths) {
      await shareDownloadedFile(localPath, 'document');
    }
    return {success: true, message: 'downloaded'};
  }

  const urls = localPaths.map(normalizeShareUri);
  if (!Share) {
    throw new Error('Share is not available on this platform');
  }

  return Share.open({
    urls,
    failOnCancel: false,
  });
}

export function buildDownloadFileName(
  options: Required<
    Pick<DocumentDownloadParams, 'id' | 'originalFilename' | 'extension'>
  >,
): string {
  const {id, originalFilename, extension} = options;
  const rawName = originalFilename ?? id;
  const sanitizedBase = rawName.replace(/[/\\?%*:|"<>]/g, '_').trim();

  const existingExt = sanitizedBase.includes('.')
    ? sanitizedBase.split('.').pop()
    : undefined;

  const finalExtension =
    extension ??
    (existingExt && existingExt.length <= 5 ? existingExt : undefined) ??
    'pdf';

  const baseName = sanitizedBase.replace(/\.[^.]+$/, '');
  return `${baseName || id}.${finalExtension}`;
}

function ensureDirectoryExists(directory: Directory): void {
  if (directory.exists) {
    return;
  }

  directory.create({intermediates: true, idempotent: true});
}

function normalizeShareUri(localPath: string): string {
  const trimmed = localPath.trim();
  if (!trimmed) {
    throw new Error('Missing local file path for sharing');
  }

  const hasScheme = /^[a-z][a-z0-9+.-]*:/.test(trimmed);
  if (hasScheme) {
    if (trimmed.startsWith('file:/') && !trimmed.startsWith('file://')) {
      return `file://${trimmed.slice('file:'.length)}`;
    }
    return trimmed;
  }

  return `file://${trimmed}`;
}
