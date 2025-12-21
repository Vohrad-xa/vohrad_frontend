import {useCallback, useMemo, useState} from 'react';
import {Platform} from 'react-native';
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
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 19).replace(/[T:]/g, '');
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

export function useAttachmentUpload(
  targetType?: AttachmentTargetType | null,
  targetId?: string | null,
) {
  const {mutateAsync: uploadAttachment, isPending: isSaving} =
    useUploadAttachment();

  const [pendingAttachment, setPendingAttachment] =
    useState<PendingAttachment | null>(null);
  const [isPicking, setIsPicking] = useState(false);

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
        return;
      }

      if (
        DocumentPicker.isAvailableAsync &&
        !(await DocumentPicker.isAvailableAsync())
      ) {
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
        return;
      }

      setPendingAttachment(pending);
    } catch (_error) {
      // Silently handle error
    } finally {
      setIsPicking(false);
    }
  }, [isPicking, isSaving]);

  const selectFromGallery = useCallback(async () => {
    if (isPicking || isSaving) {
      return;
    }

    setIsPicking(true);
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.85,
        allowsEditing: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const [asset] = result.assets;
      const pending = buildPendingFromCamera(asset);

      if (!pending) {
        return;
      }

      setPendingAttachment(pending);
    } catch (_error) {
      // Silently handle error
    } finally {
      setIsPicking(false);
    }
  }, [isPicking, isSaving]);

  const capturePhoto = useCallback(async () => {
    if (isPicking || isSaving) {
      return;
    }

    setIsPicking(true);
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
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
        return;
      }

      setPendingAttachment(pending);
    } catch (_error) {
      // Silently handle error
    } finally {
      setIsPicking(false);
    }
  }, [isPicking, isSaving]);

  const resetPending = useCallback(() => {
    setPendingAttachment(null);
  }, []);

  const updatePendingName = useCallback((newName: string) => {
    setPendingAttachment((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        name: newName,
      };
    });
  }, []);

  const savePendingAttachment = useCallback(async () => {
    if (isSaving || !pendingAttachment) {
      return false;
    }

    if (!targetId || !targetType) {
      return false;
    }

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

      await uploadAttachment(formData);
      setPendingAttachment(null);
      return true;
    } catch (_error) {
      // Silently handle error
      return false;
    }
  }, [isSaving, pendingAttachment, targetId, targetType, uploadAttachment]);

  const hasPending = !!pendingAttachment;

  const pendingMetadata = useMemo(() => {
    if (!pendingAttachment) {
      return null;
    }

    return {
      name: pendingAttachment.name,
      mimeType: pendingAttachment.mimeType,
      size: pendingAttachment.size,
      uri: pendingAttachment.uri,
    };
  }, [pendingAttachment]);

  return {
    selectFromDevice,
    selectFromGallery,
    capturePhoto,
    savePendingAttachment,
    resetPending,
    updatePendingName,
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
