import React from 'react';
import {View, StyleSheet, Image} from 'react-native';
import {ThemedText, ThemedView, Card} from '@/components/ui';
import {Tokens} from '@/constants/colors';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {Icon} from '@/utils';
import {makeStyleFactory} from '@/utils/style-factory';
import type {Item} from '@vohrad/types';

interface ItemHeaderProps {
  item: Item;
  imageUrl?: {uri: string} | undefined;
}

export function ItemHeader({item, imageUrl}: ItemHeaderProps) {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);

  return (
    <Card style={styles.card}>
      {/* Status Badge */}
      <View style={styles.cardContent}>
        <View style={styles.badgeContainer}>
          <ThemedView
            variant="statusBadge"
            badgeStatus={item.is_active ? 'active' : 'inactive'}
          >
            <ThemedText variant="caption" style={{color: Tokens.dark.text}}>
              {item.is_active ? 'Active' : 'Inactive'}
            </ThemedText>
          </ThemedView>
        </View>

        {/* Thumbnail */}
        <View style={styles.imageSection}>
          <View style={styles.imageContainer}>
            {imageUrl ? (
              <Image
                source={imageUrl}
                style={styles.thumbnail}
                resizeMode="cover"
              />
            ) : (
              <Icon name="image-outline" size="xxl" />
            )}
          </View>
        </View>

        {/* Name and Code*/}
        <View style={styles.titleContainer}>
          <ThemedText style={styles.itemName} numberOfLines={2}>
            {item.name}
          </ThemedText>
          <ThemedText style={styles.itemCode} numberOfLines={1}>
            {item.code.toUpperCase()}
          </ThemedText>
        </View>
      </View>
    </Card>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      card: {},
      cardContent: {
        alignItems: 'center',
        position: 'relative',
      },
      badgeContainer: {
        position: 'absolute',
        top: ds.spacing.xs,
        right: ds.spacing.xs,
      },
      imageSection: {
        marginBottom: ds.spacing.lg,
      },
      imageContainer: {
        width: ds.spacing.xxl * 2,
        height: ds.spacing.xxl * 2,
        borderRadius: ds.borderRadius.full,
        backgroundColor: theme.border,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      },
      thumbnail: {
        width: '100%',
        height: '100%',
      },
      titleContainer: {
        alignItems: 'center',
        gap: ds.spacing.xs,
      },
      itemName: {
        ...ds.typography.heading,
        textAlign: 'center',
        flexShrink: 0,
      },
      itemCode: {
        ...ds.typography.caption,
        color: theme.muted,
        flexShrink: 0,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
