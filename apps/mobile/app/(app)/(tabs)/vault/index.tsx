import React, {useCallback, useEffect, useLayoutEffect, useMemo} from 'react';
import {View, StyleSheet, Pressable} from 'react-native';
import {useSetAttachmentFilter} from '@vohrad/store';
import {useNavigation, useRouter, useLocalSearchParams} from 'expo-router';
import {RefreshableScrollView, HeaderButton, ThemedText} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {
  AttachmentsOverview,
  useAttachmentsOverview,
  useAttachmentNavigation,
} from '@/features/attachments';
import {useTheme} from '@/providers';
import {Icon, AppIcons, makeStyleFactory} from '@/utils';

export default function VaultScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams<{
    targetType?: string;
    targetId?: string;
    itemName?: string;
  }>();
  const setAttachmentFilter = useSetAttachmentFilter();
  const {theme, ds} = useTheme();
  const styles = createStyles(ds, theme);
  const {openVaultImages, openVaultAdd, clearVaultParams} =
    useAttachmentNavigation();

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
    }
  }, [initialFilter, params.itemName, setAttachmentFilter]);

  const {counts, hasActiveFilter, filterInfo, clearFilter} =
    useAttachmentsOverview({initialFilter});

  const handleClearFilter = useCallback(() => {
    clearFilter();
    clearVaultParams();
  }, [clearFilter, clearVaultParams]);

  const handleImagesPress = useCallback(() => {
    openVaultImages();
  }, [openVaultImages]);

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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderButton
          variant="add"
          onPress={handleAddPress}
          accessibilityLabel="Add attachment"
        />
      ),
    });
  }, [navigation, handleAddPress]);

  return (
    <RefreshableScrollView
      bounces
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
    >
      {hasActiveFilter && filterInfo && (
        <View style={styles.filterContainer}>
          <Pressable
            style={styles.filterChip}
            onPress={handleClearFilter}
            accessibilityRole="button"
            accessibilityLabel={`Clear filter for ${filterInfo.itemName ?? 'item'}`}
          >
            <ThemedText variant="caption" style={styles.filterText}>
              Filtered: {filterInfo.itemName ?? `Item ${filterInfo.targetId}`}
            </ThemedText>
            <Icon name={AppIcons.actions.close} size="sm" colorToken="text" />
          </Pressable>
        </View>
      )}
      <AttachmentsOverview
        counts={counts}
        onTilePress={{
          image: handleImagesPress,
        }}
      />
    </RefreshableScrollView>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      filterContainer: {
        paddingHorizontal: ds.spacing.lg,
        paddingTop: ds.spacing.md,
        paddingBottom: ds.spacing.sm,
      },
      filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: theme.secondbackground,
        borderRadius: ds.borderRadius.full,
        paddingVertical: ds.spacing.xs,
        paddingHorizontal: ds.spacing.md,
        gap: ds.spacing.sm,
        borderWidth: 1,
        borderColor: theme.border,
      },
      filterText: {
        color: theme.text,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
