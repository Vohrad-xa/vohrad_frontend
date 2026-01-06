import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import {Platform} from 'react-native';
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
import * as storage from '@/utils/storage';
import type {ItemAttachment} from '@sykamore/types';

const ATTACHMENT_OVERVIEW_ORDER_KEY = 'attachments.overview.order';
const DEFAULT_ATTACHMENT_OVERVIEW_ORDER = [
  'image',
  'document',
  'archive',
  'other',
] as const;

type AttachmentOverviewKind =
  (typeof DEFAULT_ATTACHMENT_OVERVIEW_ORDER)[number];

const isAttachmentOverviewKind = (
  value: string,
): value is AttachmentOverviewKind =>
  DEFAULT_ATTACHMENT_OVERVIEW_ORDER.includes(value as AttachmentOverviewKind);

const normalizeAttachmentOverviewOrder = (
  value: unknown,
): AttachmentOverviewKind[] => {
  const order = Array.isArray(value) ? value : [];
  const normalized: AttachmentOverviewKind[] = [];
  const seen = new Set<AttachmentOverviewKind>();

  order.forEach((entry) => {
    if (typeof entry !== 'string') {
      return;
    }

    if (!isAttachmentOverviewKind(entry) || seen.has(entry)) {
      return;
    }

    seen.add(entry);
    normalized.push(entry);
  });

  DEFAULT_ATTACHMENT_OVERVIEW_ORDER.forEach((kind) => {
    if (!seen.has(kind)) {
      normalized.push(kind);
    }
  });

  return normalized;
};

const moveAttachmentOverviewItem = (
  order: AttachmentOverviewKind[],
  from: number,
  to: number,
): AttachmentOverviewKind[] => {
  if (from === to) {
    return order;
  }

  if (from < 0 || from >= order.length) {
    return order;
  }

  if (to < 0 || to > order.length) {
    return order;
  }

  const next = order.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
};

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

  const [tileOrder, setTileOrder] = useState<AttachmentOverviewKind[]>(() => [
    ...DEFAULT_ATTACHMENT_OVERVIEW_ORDER,
  ]);
  const [tileOrderHydrated, setTileOrderHydrated] = useState(false);

  const {attachments} = useAttachmentContext();
  const {data: dashboardData} = useDashboardOverview();
  const attachmentFilter = useAttachmentFilter();

  // Search functionality
  const {attachments: searchResults, isSearchActive} = useAttachmentSearch({
    searchQuery,
    enabled: !attachmentFilter,
  });

  useEffect(() => {
    let mounted = true;

    const loadTileOrder = async () => {
      try {
        const saved = await storage.getItem(ATTACHMENT_OVERVIEW_ORDER_KEY);
        if (!mounted || !saved) {
          return;
        }

        const parsed = JSON.parse(saved);
        if (mounted) {
          setTileOrder(normalizeAttachmentOverviewOrder(parsed));
        }
      } catch (_error) {
        // Fall back to the default order.
      } finally {
        if (mounted) {
          setTileOrderHydrated(true);
        }
      }
    };

    void loadTileOrder();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!tileOrderHydrated) {
      return;
    }

    storage
      .setItem(ATTACHMENT_OVERVIEW_ORDER_KEY, JSON.stringify(tileOrder))
      .catch((error) => {
        console.warn('Failed to persist attachment overview order:', error);
      });
  }, [tileOrder, tileOrderHydrated]);

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

  const handleMoveTile = useCallback((from: number, to: number) => {
    setTileOrder((prev) => moveAttachmentOverviewItem(prev, from, to));
  }, []);

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
      tileOrder={Platform.OS === 'ios' ? tileOrder : undefined}
      onMoveTile={Platform.OS === 'ios' ? handleMoveTile : undefined}
      onTilePress={{
        image: handleImagesPress,
        document: handleDocumentsPress,
        archive: handleArchivesPress,
        other: handleOtherPress,
      }}
    />
  );
}
