import React, {useCallback, useLayoutEffect} from 'react';
import {useLocalSearchParams, useNavigation, useRouter} from 'expo-router';
import {RefreshableScrollView, HeaderButton} from '@/components/ui';
import {
  AttachmentsOverview,
  useAttachmentsOverview,
} from '@/features/attachments';
import {useTheme} from '@/providers';
import type {AttachmentTargetType} from '@vohrad/store';

export default function VaultScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const {theme} = useTheme();
  const params = useLocalSearchParams<{
    targetType?: AttachmentTargetType;
    targetId?: string;
  }>();

  const targetType = (params.targetType as AttachmentTargetType) ?? 'item';
  const targetId =
    typeof params.targetId === 'string' ? params.targetId : undefined;

  const {counts} = useAttachmentsOverview(targetType, targetId);

  const handleImagesPress = useCallback(() => {
    if (!targetId) return;
    router.push({
      pathname: '/(app)/(tabs)/vault/images',
      params: {targetType, targetId},
    });
  }, [router, targetType, targetId]);

  const canAdd = targetType === 'item' && targetId;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: canAdd
        ? () => (
            <HeaderButton
              variant="add"
              onPress={() =>
                router.push({
                  pathname: '/(app)/(tabs)/vault/add',
                  params: {targetType, targetId},
                })
              }
              accessibilityLabel="Add attachment"
            />
          )
        : undefined,
    });
  }, [navigation, router, canAdd, targetType, targetId, theme.navigationBar]);

  return (
    <RefreshableScrollView
      bounces
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
    >
      <AttachmentsOverview
        counts={counts}
        onTilePress={{
          image: handleImagesPress,
        }}
      />
    </RefreshableScrollView>
  );
}
