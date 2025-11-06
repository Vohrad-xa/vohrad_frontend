import React from 'react';
import {StyleSheet} from 'react-native';
import {ModalScrollView} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {AttachmentsOverview} from '@/features/attachments/screens/attachments-overview';
import {useItemAttachments} from '@/features/item/detail/attachments/use-item-attachments';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';

export default function ItemAttachmentsModal() {
  const {ds, theme} = useTheme();
  const styles = useStyles(ds, theme);
  const {counts, item, isLoading} = useItemAttachments();

  if (!item || isLoading) {
    return null;
  }

  return (
    <ModalScrollView contentContainerStyle={styles.container}>
      <AttachmentsOverview counts={counts} />
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
