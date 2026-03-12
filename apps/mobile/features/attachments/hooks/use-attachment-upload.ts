import {useCallback, useMemo, useState} from 'react';
import {Platform} from 'react-native';
import {errorCenter} from '@sykamore/client-runtime';
import {useUploadAttachment, type AttachmentTargetType} from '@sykamore/store';
import * as ImagePicker from 'expo-image-picker';
import type * as DocumentPickerTypes from 'expo-document-picker';

type DocumentAsset = DocumentPickerTypes.DocumentPickerAsset;
type CameraAsset = ImagePicker.ImagePickerAsset;
type DocumentPickerModule = typeof import('expo-document-picker') & {
  isAvailableAsync?: () => Promise<boolean>;
};

type AssetRef =
  | {
      kind: 'document';
      asset: DocumentAsset;
    }
  | {
      kind: 'camera';
      asset: CameraAsset;
    };

type PendingAttachment = {
  assetRef: AssetRef;
  uri: string;
  name: string;
  mimeType: string;
  extension?: string;
  size?: number;
};

type UploadableFile =
  | Blob
  | {
      uri: string;
      name: string;
      type: string;
    };

function inferFileName(uri: string): string {
  const sanitized = uri.split('?')[0] ?? uri;
  const segments = sanitized.split('/');
  const lastSegment = segments[segments.length - 1];
  return lastSegment && lastSegment.length > 0
    ? lastSegment
    : `attachment-${Date.now()}`;
}

function inferExtension(name: string): string | undefined {
  const lastDot = name.lastIndexOf('.');
  if (lastDot === -1 || lastDot === name.length - 1) {
    return undefined;
  }
  return name.slice(lastDot + 1).toLowerCase();
}

function normalizePendingData(params: {
  uri?: string;
  name?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
  type?: string | null;
  size?: number | null;
  fileSize?: number | null;
}): Omit<PendingAttachment, 'assetRef'> | null {
  if (!params.uri) {
    return null;
  }

  const providedName =
    (typeof params.name === 'string' && params.name.trim().length > 0
      ? params.name.trim()
      : undefined) ??
    (typeof params.fileName === 'string' && params.fileName.trim().length > 0
      ? params.fileName.trim()
      : undefined);

  const name = providedName ?? inferFileName(params.uri);
  const mimeType =
    (params.mimeType && params.mimeType.length > 0
      ? params.mimeType
      : undefined) ??
    (params.type === 'image' ? 'image/jpeg' : undefined) ??
    'application/octet-stream';
  const size =
    typeof params.size === 'number'
      ? params.size
      : typeof params.fileSize === 'number'
        ? params.fileSize
        : undefined;

  return {
    uri: params.uri,
    name,
    mimeType,
    extension: inferExtension(name),
    size,
  };
}

function buildPendingFromDocument(
  asset: DocumentAsset,
): PendingAttachment | null {
  const normalized = normalizePendingData({
    uri: asset.uri,
    name: asset.name,
    mimeType: asset.mimeType,
    size: asset.size,
  });

  if (!normalized) {
    return null;
  }

  return {
    assetRef: {kind: 'document', asset},
    ...normalized,
  };
}

function buildPendingFromCamera(asset: CameraAsset): PendingAttachment | null {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '');
  const fileName = `IMG-${timestamp}.jpg`;

  const normalized = normalizePendingData({
    uri: asset.uri,
    name: fileName,
    fileName,
    mimeType: asset.mimeType,
    type: asset.type,
    fileSize: asset.fileSize,
  });

  if (!normalized) {
    return null;
  }

  return {
    assetRef: {kind: 'camera', asset},
    ...normalized,
  };
}

async function loadDocumentPicker(): Promise<DocumentPickerModule | null> {
  const DocumentPicker = (await import('expo-document-picker').catch(
    () => null,
  )) as DocumentPickerModule | null;

  if (!DocumentPicker) {
    return null;
  }

  if (
    DocumentPicker.isAvailableAsync &&
    !(await DocumentPicker.isAvailableAsync())
  ) {
    return null;
  }

  return DocumentPicker;
}

async function pickDeviceDocument(): Promise<PendingAttachment | null> {
  const DocumentPicker = await loadDocumentPicker();
  if (!DocumentPicker) {
    return null;
  }

  const result = await DocumentPicker.getDocumentAsync({
    multiple: false,
    copyToCacheDirectory: true,
    type: '*/*',
  });

  if (result.canceled || !result.assets?.length) {
    return null;
  }

  return buildPendingFromDocument(result.assets[0]!);
}

async function pickGalleryImage(): Promise<PendingAttachment | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.85,
    allowsEditing: false,
  });

  if (result.canceled || !result.assets?.length) {
    return null;
  }

  return buildPendingFromCamera(result.assets[0]!);
}

async function captureCameraImage(): Promise<PendingAttachment | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    quality: 0.85,
  });

  if (result.canceled || !result.assets?.length) {
    return null;
  }

  return buildPendingFromCamera(result.assets[0]!);
}

async function resolveWebFile(
  assetRef: AssetRef,
  uri: string,
  filename: string,
  mimeType: string,
): Promise<File | Blob> {
  if (assetRef.kind === 'document' && assetRef.asset.file) {
    return assetRef.asset.file;
  }

  const response = await fetch(uri);
  const blob = await response.blob();
  return new File([blob], filename, {type: mimeType});
}

async function buildUploadFormData(
  pendingAttachment: PendingAttachment,
  targetType: AttachmentTargetType,
  targetId: string,
): Promise<FormData> {
  const {assetRef, uri, name, mimeType, extension, size} = pendingAttachment;
  const formData = new FormData();

  const fileValue: UploadableFile =
    Platform.OS === 'web'
      ? await resolveWebFile(assetRef, uri, name, mimeType)
      : {uri, name, type: mimeType};

  formData.append('file', fileValue as unknown as Blob);
  formData.append('target_type', targetType);
  formData.append('target_id', targetId);
  formData.append('original_filename', name);
  formData.append('filename', name);
  formData.append('file_type', mimeType);

  if (extension) {
    formData.append('extension', extension);
  }

  if (typeof size === 'number') {
    formData.append('size', String(size));
  }

  return formData;
}

export function useAttachmentUpload(
  targetType?: AttachmentTargetType | null,
  targetId?: string | null,
) {
  const {mutateAsync: uploadAttachment, isPending: isSaving} =
    useUploadAttachment();

  const [pendingAttachment, setPendingAttachment] =
    useState<PendingAttachment | null>(null);
  const [isPicking, setIsPicking] = useState(false);

  const runSelection = useCallback(
    async (
      select: () => Promise<PendingAttachment | null>,
      errorTitle: string,
    ) => {
      if (isPicking || isSaving) {
        return;
      }

      setIsPicking(true);
      try {
        const pending = await select();
        if (pending) {
          setPendingAttachment(pending);
        }
      } catch (error) {
        errorCenter.report(error, {
          title: errorTitle,
          scope: 'local',
        });
      } finally {
        setIsPicking(false);
      }
    },
    [isPicking, isSaving],
  );

  const selectFromDevice = useCallback(
    async () => runSelection(pickDeviceDocument, 'File selection failed'),
    [runSelection],
  );

  const selectFromGallery = useCallback(
    async () => runSelection(pickGalleryImage, 'Image selection failed'),
    [runSelection],
  );

  const capturePhoto = useCallback(
    async () => runSelection(captureCameraImage, 'Photo capture failed'),
    [runSelection],
  );

  const resetPending = useCallback(() => {
    setPendingAttachment(null);
  }, []);

  const updatePendingName = useCallback((newName: string) => {
    setPendingAttachment((current) =>
      current
        ? {
            ...current,
            name: newName,
            extension: inferExtension(newName),
          }
        : current,
    );
  }, []);

  const savePendingAttachment = useCallback(async () => {
    if (isSaving || !pendingAttachment || !targetId || !targetType) {
      return false;
    }

    try {
      const formData = await buildUploadFormData(
        pendingAttachment,
        targetType,
        targetId,
      );
      await uploadAttachment(formData);
      setPendingAttachment(null);
      return true;
    } catch (error) {
      errorCenter.report(error, {
        title: 'Upload failed',
        scope: 'local',
      });
      return false;
    }
  }, [isSaving, pendingAttachment, targetId, targetType, uploadAttachment]);

  const pendingMetadata = useMemo(
    () =>
      pendingAttachment
        ? {
            name: pendingAttachment.name,
            mimeType: pendingAttachment.mimeType,
            size: pendingAttachment.size,
            uri: pendingAttachment.uri,
          }
        : null,
    [pendingAttachment],
  );

  return {
    selectFromDevice,
    selectFromGallery,
    capturePhoto,
    savePendingAttachment,
    resetPending,
    updatePendingName,
    pendingAttachment,
    pendingMetadata,
    hasPending: !!pendingAttachment,
    isPicking,
    isSaving,
  };
}
