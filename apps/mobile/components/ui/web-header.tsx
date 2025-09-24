import React from 'react';
import {View, StyleSheet, Platform} from 'react-native';
import type {Tokens} from '@/constants/colors';
import type {DesignSystem} from '@/constants/typography';
import {useTheme} from '@/providers';
import {AppIcons} from '@/utils';
import {HeaderButton} from './header-button';
import {ThemedText} from './themed-components';

export interface WebHeaderProps {
  title?: string;
  onClose?: () => void;
  rightAction?: React.ReactNode;
}

export const WebHeader = ({title, rightAction}: WebHeaderProps) => {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);

  if (Platform.OS !== 'web') {
    return null;
  }

  const handleCloseClick = () => {
    if (Platform.OS === 'web') {
      // Find the modal overlay element
      const possibleBackdrops = [
        document.querySelector('div[class*="_overlay"]'),
        document.querySelector('.modal-backdrop'),
        document.querySelector('[role="presentation"]'),
        document.elementFromPoint(50, 50),
      ].filter((el): el is Element => el !== null);

      // Find the first backdrop that's clickable
      const clickableBackdrop = possibleBackdrops.find((el) => {
        const styles = window.getComputedStyle(el);
        return styles.pointerEvents !== 'none';
      });

      if (clickableBackdrop) {
        // Simulate complete click sequence for modal/drawer libraries
        const events = [
          new MouseEvent('mousedown', {bubbles: true, cancelable: true, clientX: 50, clientY: 50}),
          new MouseEvent('mouseup', {bubbles: true, cancelable: true, clientX: 50, clientY: 50}),
          new MouseEvent('click', {bubbles: true, cancelable: true, clientX: 50, clientY: 50}),
          new PointerEvent('pointerdown', {bubbles: true, cancelable: true, clientX: 50, clientY: 50}),
          new PointerEvent('pointerup', {bubbles: true, cancelable: true, clientX: 50, clientY: 50}),
        ];

        events.forEach((event) => clickableBackdrop.dispatchEvent(event));
      }
    }
  };

  return (
    <View style={styles.webHeader}>
      <View style={styles.webHeaderContent}>
        <View style={styles.leftSpacer} />
        {title && <ThemedText style={styles.webHeaderTitle}>{title}</ThemedText>}
        {rightAction ?? (
          <HeaderButton icon={AppIcons.navigation.close} accessibilityLabel="Close" onPress={handleCloseClick} />
        )}
      </View>
    </View>
  );
};

const createStyles = (ds: typeof DesignSystem, theme: typeof Tokens.light | typeof Tokens.dark) =>
  StyleSheet.create({
    webHeader: {
      backgroundColor: theme.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.divider,
      paddingHorizontal: ds.spacing.lg,
      minHeight: 40,
    },
    webHeaderContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    webHeaderTitle: {
      ...ds.typography.body,
      fontWeight: ds.fontWeight.semibold,
      flex: 1,
      textAlign: 'center',
    },
    leftSpacer: {
      width: ds.iconSize.md,
    },
  });

export default WebHeader;
