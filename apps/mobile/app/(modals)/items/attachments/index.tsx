import React, {useCallback} from 'react';
import {StyleSheet} from 'react-native';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {ModalScrollView} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {AttachmentsOverview} from '@/features/attachments/screens/attachments-overview';
import {useItemAttachments} from '@/features/item/detail/attachments/use-item-attachments';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';

export default function ItemAttachmentsModal() {
  const {ds, theme} = useTheme();
  const styles = useStyles(ds, theme);
  const router = useRouter();
  const params = useLocalSearchParams<{id?: string}>();
  const {counts, item} = useItemAttachments();

  const itemId =
    item?.id ?? (typeof params.id === 'string' ? params.id : undefined);

  const handleImagesPress = useCallback(() => {
    if (!itemId) {
      return;
    }

    router.push({
      pathname: '/items/attachments/images',
      params: {id: itemId},
    });
  }, [itemId, router]);

  return (
    <ModalScrollView contentContainerStyle={styles.container}>
      <AttachmentsOverview
        counts={counts}
        onTilePress={{
          image: handleImagesPress,
        }}
      />
    </ModalScrollView>
  );
}

const useStyles = makeStyleFactory(
  (_ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
