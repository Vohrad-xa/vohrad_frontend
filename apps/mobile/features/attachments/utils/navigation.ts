import type {AttachmentTargetType} from '@sykamore/types';

export interface AttachmentNavigationTarget {
  targetType: AttachmentTargetType;
  targetId: string;
  itemName?: string;
}

type VaultPath = '/(tabs)/vault';
type VaultAddPath = '/(tabs)/vault/add';
type VaultImagesPath = '/(tabs)/vault/images';
type VaultDocumentsPath = '/(tabs)/vault/documents';
type VaultArchivesPath = '/(tabs)/vault/archives';
type VaultOtherPath = '/(tabs)/vault/other';

export const VAULT_SEARCH_SCOPES = {
  index: 'vault.index',
  images: 'vault.images',
  documents: 'vault.documents',
  archives: 'vault.archives',
  other: 'vault.other',
} as const;

export interface AttachmentRoute<Path extends string> {
  pathname: Path;
  params: Record<string, string>;
}

const BASE_VAULT_PATH: VaultPath = '/(tabs)/vault';

export function buildAttachmentVaultBaseRoute(): AttachmentRoute<VaultPath> {
  return {
    pathname: BASE_VAULT_PATH,
    params: {},
  };
}

export function buildAttachmentVaultRoute(
  target: AttachmentNavigationTarget,
): AttachmentRoute<VaultPath> {
  const params: Record<string, string> = {
    targetType: target.targetType,
    targetId: target.targetId,
  };

  if (target.itemName) {
    params.itemName = target.itemName;
  }

  return {
    pathname: BASE_VAULT_PATH,
    params,
  };
}

export function buildAttachmentVaultAddRoute(
  target: AttachmentNavigationTarget,
): AttachmentRoute<VaultAddPath> {
  const {params} = buildAttachmentVaultRoute(target);
  return {
    pathname: `${BASE_VAULT_PATH}/add`,
    params,
  };
}

export function buildAttachmentVaultImagesRoute(): AttachmentRoute<VaultImagesPath> {
  return {
    pathname: `${BASE_VAULT_PATH}/images`,
    params: {},
  };
}

export function buildAttachmentVaultDocumentsRoute(): AttachmentRoute<VaultDocumentsPath> {
  return {
    pathname: `${BASE_VAULT_PATH}/documents`,
    params: {},
  };
}

export function buildAttachmentVaultArchivesRoute(): AttachmentRoute<VaultArchivesPath> {
  return {
    pathname: `${BASE_VAULT_PATH}/archives`,
    params: {},
  };
}

export function buildAttachmentVaultOtherRoute(): AttachmentRoute<VaultOtherPath> {
  return {
    pathname: `${BASE_VAULT_PATH}/other`,
    params: {},
  };
}

export function buildAttachmentVaultHref(target: AttachmentNavigationTarget) {
  const {pathname, params} = buildAttachmentVaultRoute(target);
  const query = new URLSearchParams(params).toString();
  return `${pathname}?${query}`;
}
