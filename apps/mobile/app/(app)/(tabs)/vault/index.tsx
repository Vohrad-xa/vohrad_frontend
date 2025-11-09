import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useEffect,
  useRef,
} from 'react';
import {useNavigation, useRouter} from 'expo-router';
import {View, StyleSheet, Pressable} from 'react-native';
import {RefreshableScrollView, HeaderButton, ThemedText} from '@/components/ui';
import {AttachmentsOverview} from '@/features/attachments';
import {
  useAttachmentsListManager,
  useVaultFilter,
  useClearVaultFilter,
} from '@vohrad/store';
import {computeAttachmentCounts} from '@/features/attachments/utils/attachment-counts';
import {useTheme} from '@/providers';
import {Icon, AppIcons, makeStyleFactory} from '@/utils';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';

export default function VaultScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const {theme, ds} = useTheme();
  const styles = createStyles(ds, theme);

  const vaultFilter = useVaultFilter();
  const clearVaultFilter = useClearVaultFilter();
  const {attachments, setFilters} = useAttachmentsListManager();
  const isInitialMount = useRef(true);

  // Sync filters with vault filter state (backend filtering)
  useEffect(() => {
    // Skip initial mount - manager already initializes with empty filters
    if (isInitialMount.current && !vaultFilter) {
      isInitialMount.current = false;
      return;
    }
    isInitialMount.current = false;

    if (vaultFilter) {
      setFilters({
        targetType: vaultFilter.targetType,
        targetId: vaultFilter.targetId,
      });
    } else {
      setFilters({});
    }
  }, [vaultFilter, setFilters]);

  const counts = useMemo(
    () => computeAttachmentCounts(attachments),
    [attachments],
  );

  const hasActiveFilter = Boolean(vaultFilter);
  const filterTargetType = vaultFilter?.targetType;
  const filterTargetId = vaultFilter?.targetId;
  const filterItemName = vaultFilter?.itemName;

  const handleClearFilter = useCallback(() => {
    clearVaultFilter();
  }, [clearVaultFilter]);

  const handleImagesPress = useCallback(() => {
    router.push('/(app)/(tabs)/vault/images');
  }, [router]);

  const canAdd = vaultFilter?.targetType === 'item' && vaultFilter?.targetId;

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
  }, [navigation, router, canAdd, filterTargetType, filterTargetId]);

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
