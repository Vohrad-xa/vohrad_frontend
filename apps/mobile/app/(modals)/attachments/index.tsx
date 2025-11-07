import React, {useCallback, useLayoutEffect} from 'react';
import {Platform} from 'react-native';
import {useLocalSearchParams, useNavigation, useRouter} from 'expo-router';
import {ModalScrollView, HeaderButton} from '@/components/ui';
import {
  AttachmentsOverview,
  useAttachmentsOverview,
} from '@/features/attachments';
import {useTheme} from '@/providers';
import type {AttachmentTargetType} from '@vohrad/store';

export default function AttachmentsOverviewModal() {
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
      pathname: '/attachments/images',
      params: {targetType, targetId},
    });
  }, [router, targetType, targetId]);

  const canAdd = targetType === 'item' && targetId;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <HeaderButton
          variant="close"
          onPress={() => router.dismiss()}
          accessibilityLabel="Close attachments"
        />
      ),
      headerRight: canAdd
        ? () => (
            <HeaderButton
              variant="add"
              onPress={() =>
                router.push({
                  pathname: '/items/attachments/add',
                  params: {id: targetId},
                })
              }
              accessibilityLabel="Add attachment"
            />
          )
        : undefined,
      headerStyle:
        Platform.OS === 'android'
          ? {backgroundColor: theme.navigationBar}
          : undefined,
    });
  }, [navigation, router, canAdd, targetId, theme.navigationBar]);

  return (
    <ModalScrollView>
      <AttachmentsOverview
        counts={counts}
        onTilePress={{
          image: handleImagesPress,
        }}
      />
    </ModalScrollView>
  );
}
