import React from 'react';
import {StyleSheet, View} from 'react-native';
import {ModalScrollView, ThemedText} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';

export default function ItemAttachmentsModal() {
  const {ds, theme} = useTheme();
  const styles = useStyles(ds, theme);

  return (
    <ModalScrollView contentContainerStyle={styles.container}>
      <View style={styles.placeholder}>
        <ThemedText variant="heading">Attachments</ThemedText>
        <ThemedText variant="secondary" style={styles.message}>
          Attachment details will appear here.
        </ThemedText>
      </View>
    </ModalScrollView>
  );
}

const useStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        flexGrow: 1,
        padding: ds.spacing.xl,
        justifyContent: 'center',
      },
      placeholder: {
        alignItems: 'center',
        gap: ds.spacing.md,
      },
      message: {
        textAlign: 'center',
        color: theme.muted,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
