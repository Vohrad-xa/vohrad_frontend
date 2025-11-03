import React from 'react';
import {StyleSheet, View, type ViewStyle} from 'react-native';
import {type DSShape, themeKey, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';
import {Divider} from '../ui/divider';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  withDivider?: boolean;
}

export function Card({children, style, withDivider}: CardProps) {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);

  if (withDivider) {
    const childArray = React.Children.toArray(children);
    return (
      <View style={[styles.card, style]}>
        <View style={styles.childContainer}>
          {childArray.map((child, index) => (
            <View key={index}>
              <View style={styles.contentWrapper}>{child}</View>
              {index < childArray.length - 1 && (
                <View style={styles.dividerWrapper}>
                  <Divider />
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.card, style]}>
      <View style={styles.childContainer}>{children}</View>
    </View>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      card: {
        backgroundColor: theme.input,
        borderRadius: ds.components.card.borderRadius,
      },
      childContainer: {
        padding: ds.spacing.lg,
      },
      contentWrapper: {
        paddingVertical: ds.spacing.xs,
      },
      dividerWrapper: {
        paddingVertical: ds.spacing.md,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
