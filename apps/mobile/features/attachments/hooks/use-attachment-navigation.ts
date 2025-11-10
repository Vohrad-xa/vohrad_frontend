import {useCallback} from 'react';
import {useRouter} from 'expo-router';
import {
  buildAttachmentVaultBaseRoute,
  buildAttachmentVaultRoute,
  buildAttachmentVaultAddRoute,
  buildAttachmentVaultImagesRoute,
} from '../utils/navigation';
import type {AttachmentNavigationTarget} from '../utils/navigation';

export function useAttachmentNavigation() {
  const router = useRouter();

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

  return {
    openVaultRoot,
    clearVaultParams,
    openVault,
    openVaultAdd,
    openVaultImages,
  };
}
