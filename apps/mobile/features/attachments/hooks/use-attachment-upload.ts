import {useCallback, useMemo, useState} from 'react';
import {Platform} from 'react-native';
import {
  useAuthStore,
  useAttachmentManager,
  type AttachmentTargetType,
} from '@vohrad/store';
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
  const uri = params.uri;
  if (!uri) {
    return null;
  }

  const providedName =
    (typeof params.name === 'string' && params.name.trim().length > 0
      ? params.name.trim()
      : undefined) ??
    (typeof params.fileName === 'string' && params.fileName.trim().length > 0
      ? params.fileName.trim()
      : undefined);

  const name = providedName ?? inferFileName(uri);
  const mimeType =
    (params.mimeType && params.mimeType.length > 0
      ? params.mimeType
      : undefined) ??
    (params.type === 'image' ? 'image/jpeg' : undefined) ??
    'application/octet-stream';
  const extension = inferExtension(name);
  const size =
    typeof params.size === 'number'
      ? params.size
      : typeof params.fileSize === 'number'
        ? params.fileSize
        : undefined;

  return {
    uri,
    name,
    mimeType,
    extension,
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
  const normalized = normalizePendingData({
    uri: asset.uri,
    name: asset.fileName,
    fileName: asset.fileName,
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

export function useAttachmentUpload(
  targetType: AttachmentTargetType,
  targetId?: string | null,
) {
  const setError = useAuthStore((state) => state.setError);
  const {uploadAttachment: uploadAttachmentForTarget} =
    useAttachmentManager(targetType, targetId);

  const [pendingAttachment, setPendingAttachment] =
    useState<PendingAttachment | null>(null);
  const [isPicking, setIsPicking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const selectFromDevice = useCallback(async () => {
    if (isPicking || isSaving) {
      return;
    }

    setIsPicking(true);
    try {
      const DocumentPicker = (await import('expo-document-picker').catch(
        () => null,
      )) as DocumentPickerModule | null;

      if (!DocumentPicker) {
        setError('Document picker is not available on this device.');
        return;
      }

      if (
        DocumentPicker.isAvailableAsync &&
        !(await DocumentPicker.isAvailableAsync())
      ) {
        setError('Document picker is not available on this device.');
        return;
      }

      const result = await DocumentPicker.getDocumentAsync({
        multiple: false,
        copyToCacheDirectory: true,
        type: '*/*',
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const [asset] = result.assets;
      const pending = buildPendingFromDocument(asset);

      if (!pending) {
        setError('Unable to read the selected file.');
        return;
      }

      setPendingAttachment(pending);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to pick a file right now.';
      setError(message);
    } finally {
      setIsPicking(false);
    }
  }, [isPicking, isSaving, setError]);

  const capturePhoto = useCallback(async () => {
    if (isPicking || isSaving) {
      return;
    }

    setIsPicking(true);
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        setError('Camera permission is required to take a photo.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.85,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const [asset] = result.assets;
      const pending = buildPendingFromCamera(asset);

      if (!pending) {
        setError('Unable to capture photo.');
        return;
      }

      setPendingAttachment(pending);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to open the camera right now.';
      setError(message);
    } finally {
      setIsPicking(false);
    }
  }, [isPicking, isSaving, setError]);

  const resetPending = useCallback(() => {
    setPendingAttachment(null);
  }, []);

  const savePendingAttachment = useCallback(async () => {
    if (isSaving || !pendingAttachment) {
      return false;
    }

    if (!targetId) {
      setError('Missing attachment target reference.');
      return false;
    }

    setIsSaving(true);
    try {
      const {assetRef, uri, name, mimeType, extension, size} =
        pendingAttachment;
      const formData = new FormData();
      const fileValue =
        Platform.OS === 'web'
          ? await resolveWebFile(assetRef, uri, name, mimeType)
          : ({
              uri,
              name,
              type: mimeType,
            } as unknown as Blob);

      formData.append('file', fileValue);
      formData.append('attachable_type', targetType);
      formData.append('attachable_id', targetId);
      formData.append('original_filename', name);
      formData.append('filename', name);
      formData.append('file_type', mimeType);
      if (extension) {
        formData.append('extension', extension);
      }
      if (typeof size === 'number') {
        formData.append('size', String(size));
      }

      await uploadAttachmentForTarget(formData);
      // uploadAttachmentForTarget already updates both caches
      setPendingAttachment(null);
      return true;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to upload attachment right now.';
      setError(message);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [
    isSaving,
    pendingAttachment,
    targetId,
    targetType,
    setError,
    uploadAttachmentForTarget,
  ]);

  const hasPending = !!pendingAttachment;

  const pendingMetadata = useMemo(() => {
    if (!pendingAttachment) {
      return null;
    }

    return {
      name: pendingAttachment.name,
      mimeType: pendingAttachment.mimeType,
      size: pendingAttachment.size,
    };
  }, [pendingAttachment]);

  return {
    selectFromDevice,
    capturePhoto,
    savePendingAttachment,
    resetPending,
    pendingAttachment,
    pendingMetadata,
    hasPending,
    isPicking,
    isSaving,
  };
}

async function resolveWebFile(
  assetRef: AssetRef,
  uri: string,
  filename: string,
  mimeType: string,
) {
  if (assetRef.kind === 'document' && assetRef.asset.file) {
    return assetRef.asset.file;
  }

  const response = await fetch(uri);
  const blob = await response.blob();
  return new File([blob], filename, {type: mimeType});
}
