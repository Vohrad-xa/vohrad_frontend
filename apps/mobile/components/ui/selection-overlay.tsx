import React from 'react';
import {StyleSheet, View} from 'react-native';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';

type SelectionOverlayProps = {
  isSelected: boolean;
  children: React.ReactNode;
  selectionMode: boolean;
};

export function SelectionOverlay({
  isSelected,
  children,
  selectionMode,
}: SelectionOverlayProps) {
  const {ds, theme} = useTheme();
  const styles = useStyles(ds, theme);

  return (
    <View style={styles.container}>
      {children}
      {selectionMode && isSelected && <View style={styles.selectedOverlay} />}
    </View>
  );
}

const useStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        position: 'relative',
      },
      selectedOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: theme.accentBlue,
        opacity: 0.2,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
