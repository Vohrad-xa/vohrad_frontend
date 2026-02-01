import {useCallback} from 'react';
import {useSafeRouter} from '@/utils';
import {
  buildAttachmentVaultBaseRoute,
  buildAttachmentVaultRoute,
  buildAttachmentVaultAddRoute,
  buildAttachmentVaultImagesRoute,
  buildAttachmentVaultDocumentsRoute,
  buildAttachmentVaultArchivesRoute,
  buildAttachmentVaultOtherRoute,
  type AttachmentNavigationTarget,
} from '../utils';

export function useAttachmentNavigation() {
  const router = useSafeRouter();

  const openVaultRoot = useCallback(() => {
    const route = buildAttachmentVaultBaseRoute();
    router.push(route);
  }, [router]);

  const clearVaultParams = useCallback(() => {
    router.setParams({
      targetType: undefined,
      targetId: undefined,
      itemName: undefined,
    } as Record<string, string | undefined>);
  }, [router]);

  const openVault = useCallback(
    (target: AttachmentNavigationTarget) => {
      const route = buildAttachmentVaultRoute(target);
      router.push(route);
    },
    [router],
  );

  const openVaultAdd = useCallback(
    (target: AttachmentNavigationTarget) => {
      const route = buildAttachmentVaultAddRoute(target);
      router.push(route);
    },
    [router],
  );

  const openVaultImages = useCallback(() => {
    const route = buildAttachmentVaultImagesRoute();
    router.push(route);
  }, [router]);

  const openVaultDocuments = useCallback(() => {
    const route = buildAttachmentVaultDocumentsRoute();
    router.push(route);
  }, [router]);

  const openVaultArchives = useCallback(() => {
    const route = buildAttachmentVaultArchivesRoute();
    router.push(route);
  }, [router]);

  const openVaultOther = useCallback(() => {
    const route = buildAttachmentVaultOtherRoute();
    router.push(route);
  }, [router]);

  return {
    openVaultRoot,
    clearVaultParams,
    openVault,
    openVaultAdd,
    openVaultImages,
    openVaultDocuments,
    openVaultArchives,
    openVaultOther,
  };
}
