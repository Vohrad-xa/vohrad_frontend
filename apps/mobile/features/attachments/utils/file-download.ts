import {Share, Platform} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

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
    // For web, just return the URL - we'll handle downloading directly in share function
    return options.sourceUrl;
  }

  const baseDir = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;
  if (!baseDir) {
    throw new Error('File system unavailable');
  }

  const downloadsDir = `${baseDir}documents`;
  await ensureDirectoryExists(downloadsDir);

  const fileName = buildDownloadFileName(options);
  const targetPath = `${downloadsDir}/${fileName}`;
  await FileSystem.downloadAsync(options.sourceUrl, targetPath);
  return targetPath;
}

export async function shareDownloadedFile(
  localPath: string,
  displayName: string,
  _mimeType?: string,
): Promise<void> {
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
    return;
  }

  await Share.share({
    url: localPath,
    message: displayName,
    title: displayName,
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

async function ensureDirectoryExists(path: string): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(path);
  if (dirInfo.exists && dirInfo.isDirectory) {
    return;
  }

  await FileSystem.makeDirectoryAsync(path, {intermediates: true});
}
