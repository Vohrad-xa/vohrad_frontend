import React from 'react';
import {StyleSheet} from 'react-native';
import {ModalScrollView} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {AttachmentsOverview} from '@/features/attachments/screens/attachments-overview';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';

export default function ItemAttachmentsModal() {
  const {ds, theme} = useTheme();
  const styles = useStyles(ds, theme);

  return (
    <ModalScrollView contentContainerStyle={styles.container}>
      <AttachmentsOverview
        counts={{image: 0, document: 0, video: 0, archive: 0, other: 0}}
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
