import React from 'react';
import {StyleSheet, Platform} from 'react-native';
import {Card} from '@/components/cards/card';
import {ModalScrollView, ThemedText} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils';

export default function AttachmentDestinationSelectorModal() {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);

  return (
    <ModalScrollView style={styles.container}>
      <Card>
        <Card.Row icon="albums-outline" accessibilityLabel="Select item">
          <ThemedText variant="label">Items</ThemedText>
        </Card.Row>
        <Card.Divider withIconOffset />
        <Card.Row icon="locate-outline" accessibilityLabel="Select location">
          <ThemedText variant="label">Locations</ThemedText>
        </Card.Row>
        <Card.Divider withIconOffset />
        <Card.Row
          icon="layers-outline"
          accessibilityLabel="Select item location"
        >
          <ThemedText variant="label">Maintenances</ThemedText>
        </Card.Row>
      </Card>
    </ModalScrollView>
  );
}

const createStyles = makeStyleFactory(
  (_ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        backgroundColor:
          Platform.OS === 'web' ? theme.webbackground : theme.secondbackground,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
