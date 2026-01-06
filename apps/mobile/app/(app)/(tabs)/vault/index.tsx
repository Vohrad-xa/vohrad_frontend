import React, {useCallback, useEffect, useLayoutEffect, useMemo} from 'react';
import {
  useSetAttachmentFilter,
  useClearAttachmentFilter,
  useAttachmentFilter,
  useDashboardOverview,
} from '@sykamore/store';
import {useNavigation, useRouter, useLocalSearchParams} from 'expo-router';
import {
  AttachmentsOverview,
  useAttachmentNavigation,
  computeAttachmentCounts,
  useAttachmentSearch,
  useAttachmentPress,
  VaultActionsMenu,
  AttachmentsList,
  useAttachmentContext,
} from '@/features/attachments';
import {useSearch} from '@/features/dashboard';
import type {ItemAttachment} from '@sykamore/types';

export default function VaultScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams<{
    targetType?: string;
    targetId?: string;
    itemName?: string;
  }>();
  const setAttachmentFilter = useSetAttachmentFilter();
  const clearAttachmentFilter = useClearAttachmentFilter();
  const {searchQuery} = useSearch();
  const handleAttachmentPress = useAttachmentPress();
  const {
    openVaultImages,
    openVaultDocuments,
    openVaultArchives,
    openVaultOther,
    openVaultAdd,
    clearVaultParams,
  } = useAttachmentNavigation();

  const {attachments} = useAttachmentContext();
  const {data: dashboardData} = useDashboardOverview();
  const attachmentFilter = useAttachmentFilter();

  // Search functionality
  const {attachments: searchResults, isSearchActive} = useAttachmentSearch({
    searchQuery,
    enabled: !attachmentFilter,
  });

  const initialFilter = useMemo(() => {
    if (params.targetType === 'item' && typeof params.targetId === 'string') {
      return {
        targetType: 'item' as const,
        targetId: params.targetId,
      };
    }
    return undefined;
  }, [params.targetType, params.targetId]);

  useEffect(() => {
    if (initialFilter) {
      setAttachmentFilter({
        targetType: initialFilter.targetType,
        targetId: initialFilter.targetId,
        itemName: params.itemName,
      });
    } else {
      clearAttachmentFilter();
    }
  }, [
    initialFilter,
    params.itemName,
    setAttachmentFilter,
    clearAttachmentFilter,
  ]);

  // Compute counts locally from context data or use dashboard data
  const counts = useMemo(() => {
    if (attachmentFilter) {
      // Item-specific: compute from fetched attachments
      return computeAttachmentCounts(attachments);
    }
    // Global vault: use dashboard counts
    return (
      dashboardData?.attachment_counts ?? {
        image: 0,
        document: 0,
        video: 0,
        archive: 0,
        other: 0,
      }
    );
  }, [attachmentFilter, attachments, dashboardData]);

  const hasActiveFilter = Boolean(attachmentFilter);

  const filterInfo = useMemo(() => {
    if (!attachmentFilter?.targetType || !attachmentFilter?.targetId) {
      return null;
    }
    return {
      targetType: attachmentFilter.targetType,
      targetId: attachmentFilter.targetId,
      itemName: attachmentFilter.itemName,
    };
  }, [attachmentFilter]);

  const filterLabel = useMemo(() => {
    if (!filterInfo) return '';
    const typeLabel =
      filterInfo.targetType === 'item'
        ? 'Item'
        : filterInfo.targetType === 'location'
          ? 'Location'
          : 'Item Location';
    return `${typeLabel} ${filterInfo.itemName ?? filterInfo.targetId}`;
  }, [filterInfo]);

  const filterAccessibilityLabel = useMemo(() => {
    if (!filterInfo) return 'Clear filter';
    const typeLabel =
      filterInfo.targetType === 'item'
        ? 'item'
        : filterInfo.targetType === 'location'
          ? 'location'
          : 'item location';
    return `Clear ${typeLabel} filter for ${filterInfo.itemName ?? filterInfo.targetId}`;
  }, [filterInfo]);

  const handleClearFilter = useCallback(() => {
    clearAttachmentFilter();
    clearVaultParams();
  }, [clearAttachmentFilter, clearVaultParams]);

  const filterChip =
    hasActiveFilter && filterInfo
      ? {
          label: filterLabel,
          onClear: handleClearFilter,
          accessibilityLabel: filterAccessibilityLabel,
        }
      : undefined;

  const handleImagesPress = useCallback(() => {
    openVaultImages();
  }, [openVaultImages]);

  const handleDocumentsPress = useCallback(() => {
    openVaultDocuments();
  }, [openVaultDocuments]);

  const handleArchivesPress = useCallback(() => {
    openVaultArchives();
  }, [openVaultArchives]);

  const handleOtherPress = useCallback(() => {
    openVaultOther();
  }, [openVaultOther]);

  const handleAddPress = useCallback(() => {
    // If there's a filter, pass params; otherwise navigate without params (item selection handled in add screen)
    if (filterInfo) {
      openVaultAdd({
        targetType: filterInfo.targetType,
        targetId: filterInfo.targetId,
        itemName: filterInfo.itemName,
      });
    } else {
      router.push('/(app)/(tabs)/vault/add');
    }
  }, [router, filterInfo, openVaultAdd]);

  const handleSearchResultPress = useCallback(
    async (attachmentId: string) => {
      const attachment = searchResults.find(
        (a: ItemAttachment) => a.id === attachmentId,
      );
      if (!attachment) {
        return;
      }
      await handleAttachmentPress(attachment);
    },
    [searchResults, handleAttachmentPress],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <VaultActionsMenu onAddDocument={handleAddPress} />,
    });
  }, [navigation, handleAddPress]);

  // Show search results when user is typing
  if (isSearchActive && !hasActiveFilter) {
    return (
      <AttachmentsList
        attachments={searchResults}
        onAttachmentPress={handleSearchResultPress}
      />
    );
  }

  return (
    <AttachmentsOverview
      counts={counts}
      filterChip={filterChip}
      onTilePress={{
        image: handleImagesPress,
        document: handleDocumentsPress,
        archive: handleArchivesPress,
        other: handleOtherPress,
      }}
    />
  );
}
