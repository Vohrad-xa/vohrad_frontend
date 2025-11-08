import React, {useCallback, useLayoutEffect, useMemo, useEffect} from 'react';
import {useLocalSearchParams, useNavigation, useRouter} from 'expo-router';
import {View, StyleSheet, Pressable} from 'react-native';
import {RefreshableScrollView, HeaderButton, ThemedText} from '@/components/ui';
import {AttachmentsOverview} from '@/features/attachments';
import {useAttachmentsListManager} from '@vohrad/store';
import {computeAttachmentCounts} from '@/features/attachments/utils/attachment-counts';
import {useTheme} from '@/providers';
import {Icon, AppIcons, makeStyleFactory} from '@/utils';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import type {AttachmentTargetType} from '@vohrad/store';

export default function VaultScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const {theme, ds} = useTheme();
  const styles = createStyles(ds, theme);
  const params = useLocalSearchParams<{
    filterTargetType?: AttachmentTargetType;
    filterTargetId?: string;
    filterItemName?: string;
  }>();

  const filterTargetType = params.filterTargetType as
    | AttachmentTargetType
    | undefined;
  const filterTargetId = params.filterTargetId;
  const filterItemName = params.filterItemName;

  const {attachments, setFilters} = useAttachmentsListManager();

  // Sync filters with URL params (backend OData filtering)
  useEffect(() => {
    const newFilters: {targetType?: AttachmentTargetType; targetId?: string} =
      {};
    if (filterTargetType) newFilters.targetType = filterTargetType;
    if (filterTargetId) newFilters.targetId = filterTargetId;
    setFilters(newFilters);
  }, [filterTargetType, filterTargetId, setFilters]);

  const counts = useMemo(
    () => computeAttachmentCounts(attachments),
    [attachments],
  );

  const hasActiveFilter = Boolean(filterTargetType && filterTargetId);

  const handleClearFilter = useCallback(() => {
    router.push('/(app)/(tabs)/vault');
  }, [router]);

  const handleImagesPress = useCallback(() => {
    router.push({
      pathname: '/(app)/(tabs)/vault/images',
      params: hasActiveFilter
        ? {
            filterTargetType,
            filterTargetId,
            filterItemName,
          }
        : {},
    });
  }, [
    router,
    hasActiveFilter,
    filterTargetType,
    filterTargetId,
    filterItemName,
  ]);

  const canAdd = filterTargetType === 'item' && filterTargetId;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: canAdd
        ? () => (
            <HeaderButton
              variant="add"
              onPress={() =>
                router.push({
                  pathname: '/(app)/(tabs)/vault/add',
                  params: {
                    targetType: filterTargetType,
                    targetId: filterTargetId,
                  },
                })
              }
              accessibilityLabel="Add attachment"
            />
          )
        : undefined,
    });
  }, [
    navigation,
    router,
    canAdd,
    filterTargetType,
    filterTargetId,
    theme.navigationBar,
  ]);

  return (
    <RefreshableScrollView
      bounces
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
    >
      {hasActiveFilter && (
        <View style={styles.filterContainer}>
          <Pressable
            style={styles.filterChip}
            onPress={handleClearFilter}
            accessibilityRole="button"
            accessibilityLabel={`Clear filter for ${filterItemName || 'item'}`}
          >
            <ThemedText variant="caption" style={styles.filterText}>
              Filtered: {filterItemName || `Item ${filterTargetId}`}
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
